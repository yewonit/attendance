/**
 * 인증 서비스 — 토큰 발급·검증, 이메일 인증, 비밀번호 관리
 * 예전에는 별도 account 서비스를 호출했지만 이제 이 서버가 직접 처리합니다.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/user';
import { AppError, BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { hashPassword } from '../../utils/password';
import { authStore } from './auth.store';
import { sendVerificationMail } from './mailer';
import {
  type TokenPair,
  type TokenSubject,
  consumeRefreshToken,
  issueTokens,
  normalizeEmail,
  revokeAllSessions,
  verifyAccessToken,
} from './token.service';

const EMAIL_CODE_TTL = 60 * 30;
const EMAIL_RESEND_COOLDOWN = 60;
const EMAIL_CODE_MAX_ATTEMPTS = 5;
/** 이메일 인증 후 등록·비밀번호 재설정을 마칠 때까지 허용하는 시간 */
const EMAIL_VERIFIED_TTL = 60 * 30;

// 단일 일반 이메일 주소만 허용 — 따옴표·주석·그룹·다중 수신자로 메일 주소 파서를 혼동시켜
// 인증 코드를 다른 곳으로 보내게 만드는 공격을 막는다
const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/;
const isValidEmail = (value: string) => value.length <= 254 && EMAIL_PATTERN.test(value);

// 토큰 오류는 예전 account 서비스와 같은 400으로 응답한다 — 프론트엔드가 이 동작에 맞춰져 있다
const invalidToken = (kind: string) => new BadRequestError(`유효하지 않은 ${kind}입니다.`);

/** 비밀번호 확인을 마친 사용자에게 토큰을 발급합니다. */
export async function loginWithEmailAndPassword(email: string, name: string): Promise<TokenPair> {
  return issueTokens({ email, name });
}

/** 액세스 토큰을 검증합니다. */
export async function verifyWithToken(accessToken: string): Promise<TokenSubject> {
  const subject = await verifyAccessToken(accessToken);
  if (!subject) throw invalidToken('액세스 토큰');
  return subject;
}

/** 리프레시 토큰으로 새 토큰을 발급합니다. 사용한 리프레시 토큰은 폐기됩니다. */
export async function refreshWithToken(refreshToken: string): Promise<TokenPair> {
  const subject = await consumeRefreshToken(refreshToken);
  if (!subject) throw invalidToken('리프레시 토큰');

  // 탈퇴·삭제된 사용자는 더 이상 갱신할 수 없게 하고, 바뀐 이름을 반영한다
  const [user] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.email, subject.email))
    .limit(1);
  if (!user?.email) throw invalidToken('리프레시 토큰');

  return issueTokens({ email: user.email, name: user.name });
}

/** 인증 코드 이메일을 발송합니다. */
export async function sendVerifyEmail(email: string): Promise<void> {
  const receiver = email.trim();
  if (!isValidEmail(receiver)) throw new BadRequestError('유효한 이메일 주소가 아닙니다.');

  const normalized = normalizeEmail(receiver);
  if (!(await authStore.startEmailCooldown(normalized, EMAIL_RESEND_COOLDOWN))) {
    throw new AppError('TOO_MANY_REQUESTS', '잠시 후 다시 시도해주세요.', 429);
  }

  const code = randomBytes(3).toString('hex');
  try {
    await sendVerificationMail(receiver, code);
  } catch (error) {
    await authStore.clearEmailCooldown(normalized);
    const mailError = new AppError('MAIL_SEND_FAILED', '이메일 전송 중 오류가 발생했습니다.', 500);
    mailError.cause = error;
    throw mailError;
  }
  await authStore.saveEmailCode(normalized, code, EMAIL_CODE_TTL);
}

/** 이메일 인증 코드를 검증합니다. 성공하면 일정 시간 동안 등록·비밀번호 재설정이 허용됩니다. */
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  const normalized = normalizeEmail(email);

  const attempts = await authStore.countEmailAttempt(normalized, EMAIL_CODE_TTL);
  if (attempts > EMAIL_CODE_MAX_ATTEMPTS) {
    // 무차별 대입 방지 — 실패가 누적되면 코드를 폐기하고 재발송을 요구한다
    await authStore.clearEmailCode(normalized);
    return false;
  }

  const stored = await authStore.getEmailCode(normalized);
  if (!stored || !safeEqual(stored, code.trim().toLowerCase())) return false;

  await authStore.clearEmailCode(normalized);
  await authStore.markEmailVerified(normalized, EMAIL_VERIFIED_TTL);
  return true;
}

/** 이메일 인증을 마쳤는지 확인합니다. (최초 등록·비밀번호 재설정 전 필수) */
export async function assertEmailVerified(email: string): Promise<void> {
  if (!(await authStore.isEmailVerified(normalizeEmail(email)))) {
    throw new ForbiddenError('이메일 인증이 필요합니다.');
  }
}

/** 이메일 인증 상태를 소모합니다. 등록·재설정이 끝난 뒤 호출합니다. */
export async function clearEmailVerification(email: string): Promise<void> {
  await authStore.clearEmailVerified(normalizeEmail(email));
}

/** 비밀번호를 재설정합니다. 계정 이메일 인증이 선행되어야 하며, 기존 로그인 세션은 모두 끊깁니다. */
export async function resetPassword(userId: number, password: string): Promise<void> {
  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    throw new NotFoundError('User', userId);
  }
  if (!user.email) throw new BadRequestError('이메일이 등록되지 않은 계정입니다.');

  await assertEmailVerified(user.email);

  const hashed = await hashPassword(password);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));

  await clearEmailVerification(user.email);
  await revokeAllSessions(user.email);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
