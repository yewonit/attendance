/** 인증 서비스 — 외부 인증 서버 연동 및 비밀번호 관리 */
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/user';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { hashPassword } from '../../utils/password';
import { authServerRequest } from '../../utils/request';

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface VerifyResponse {
  email: string;
  name: string;
}

/** 이메일/이름으로 토큰을 발급받습니다. */
export async function loginWithEmailAndPassword(
  email: string,
  name: string,
): Promise<TokenResponse> {
  return authServerPost<TokenResponse>('/v1/token', { email, name });
}

/** 액세스 토큰을 검증합니다. */
export async function verifyWithToken(accessToken: string): Promise<VerifyResponse> {
  return authServerPost<VerifyResponse>('/v1/verify', { accessToken });
}

/** 리프레시 토큰으로 새 토큰을 발급받습니다. */
export async function refreshWithToken(refreshToken: string): Promise<TokenResponse> {
  return authServerPost<TokenResponse>('/v1/refresh', { refreshToken });
}

/** 인증 코드 이메일을 발송합니다. */
export async function sendVerifyEmail(email: string): Promise<unknown> {
  return authServerPost('/v1/mail/code', { email });
}

/** 이메일 인증 코드를 검증합니다. */
export async function verifyEmailCode(email: string, code: string): Promise<unknown> {
  return authServerPost('/v1/mail/verify', { email, code });
}

/** 비밀번호를 재설정합니다. */
export async function resetPassword(userId: number, password: string): Promise<void> {
  const user = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (user.length === 0) {
    throw new NotFoundError('User', userId);
  }

  const hashed = await hashPassword(password);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
}

/** 인증 서버 POST 요청 래퍼 — 에러 상태를 도메인 에러로 변환합니다. */
async function authServerPost<T>(path: string, body: Record<string, unknown>): Promise<T> {
  try {
    return await authServerRequest<T>(path, { method: 'POST', body });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('401')) throw new UnauthorizedError(message);
    if (message.includes('400')) throw new BadRequestError(message);
    throw error;
  }
}
