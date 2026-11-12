/**
 * 테스트용 인메모리 인증 저장소 — Redis 저장소(auth.store)와 같은 동작을 Date.now() 기준으로 흉내냅니다.
 * 실제 Redis 명령(Lua 스크립트 포함)은 로컬 Redis로 따로 검증합니다.
 */
import type { AuthStore } from '../../src/services/auth/auth.store';

const entries = new Map<string, { value: string; expiresAt: number }>();

function read(key: string) {
  const entry = entries.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    entries.delete(key);
    return undefined;
  }
  return entry;
}

function write(key: string, value: string, ttlSeconds: number) {
  entries.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function resetMemoryAuthStore() {
  entries.clear();
}

export const memoryAuthStore: AuthStore = {
  async saveRefreshToken(jti, ttlSeconds) {
    write(`refresh:${jti}`, '1', ttlSeconds);
  },
  async useRefreshToken(jti, graceSeconds) {
    const entry = read(`refresh:${jti}`);
    if (!entry) return false;
    entry.expiresAt = Math.min(entry.expiresAt, Date.now() + graceSeconds * 1000);
    return true;
  },
  async getSessionsValidAfter(email) {
    return Number(read(`valid-after:${email}`)?.value ?? 0);
  },
  async revokeSessions(email, nowSeconds, ttlSeconds) {
    write(`valid-after:${email}`, String(nowSeconds), ttlSeconds);
  },
  async startEmailCooldown(email, seconds) {
    if (read(`email-cooldown:${email}`)) return false;
    write(`email-cooldown:${email}`, '1', seconds);
    return true;
  },
  async clearEmailCooldown(email) {
    entries.delete(`email-cooldown:${email}`);
  },
  async saveEmailCode(email, code, ttlSeconds) {
    write(`email-code:${email}`, code, ttlSeconds);
    entries.delete(`email-attempts:${email}`);
  },
  async getEmailCode(email) {
    return read(`email-code:${email}`)?.value ?? null;
  },
  async countEmailAttempt(email, ttlSeconds) {
    const count = Number(read(`email-attempts:${email}`)?.value ?? 0) + 1;
    write(`email-attempts:${email}`, String(count), ttlSeconds);
    return count;
  },
  async clearEmailCode(email) {
    entries.delete(`email-code:${email}`);
    entries.delete(`email-attempts:${email}`);
  },
  async markEmailVerified(email, ttlSeconds) {
    write(`email-verified:${email}`, '1', ttlSeconds);
  },
  async isEmailVerified(email) {
    return Boolean(read(`email-verified:${email}`));
  },
  async clearEmailVerified(email) {
    entries.delete(`email-verified:${email}`);
  },
};
