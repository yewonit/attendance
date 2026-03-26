/**
 * 비밀번호 해싱/검증 유틸리티
 * bcrypt를 사용하여 비밀번호를 안전하게 해싱하고 검증합니다.
 */
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/** 평문 비밀번호를 bcrypt로 해싱합니다. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** 평문 비밀번호와 해시된 비밀번호를 비교합니다. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
