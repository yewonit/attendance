import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/user';
/** 공통 검증 유틸리티 */
import { BadRequestError, ConflictError } from '../../utils/errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/;

/** 이메일 형식 및 중복 체크 */
export async function validateEmail(email: string): Promise<void> {
  if (!EMAIL_REGEX.test(email)) {
    throw new BadRequestError(`이메일이 형식에 맞지 않습니다. email: ${email}`);
  }
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    throw new ConflictError('이미 같은 email로 등록된 유저가 있습니다.');
  }
}

/** 비밀번호 형식 체크 */
export function validatePassword(password: string): void {
  if (!PASSWORD_REGEX.test(password)) {
    throw new BadRequestError('패스워드가 형식에 맞지 않습니다.');
  }
}

/** 전화번호에서 공백/하이픈을 제거합니다. */
export function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replaceAll(' ', '').replaceAll('-', '');
}
