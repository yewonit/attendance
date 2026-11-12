/**
 * 인증 상태 저장소 (Redis)
 * dev와 운영이 같은 Redis를 쓰므로 키에 환경 이름을 붙여 서로 섞이지 않게 합니다.
 * 이메일은 호출하는 쪽에서 정규화(소문자·trim)해서 넘깁니다.
 */
import { env } from '../../config/env';
import { redis } from '../../db/redis';

const PREFIX = `attendance:${env.nodeEnv}:auth`;
const key = (...parts: string[]) => [PREFIX, ...parts].join(':');

/**
 * 리프레시 토큰이 아직 유효하면 남은 수명을 grace 초 이하로 줄이고 1을 반환합니다.
 * 한 번 쓴 토큰도 grace 동안은 다시 통과시켜, 여러 탭이 같은 토큰으로 동시에 갱신해도
 * 서로를 로그아웃시키지 않게 합니다. grace를 넘긴 재사용은 거부됩니다.
 */
const USE_REFRESH_TOKEN_SCRIPT = `
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then return 0 end
if ttl > tonumber(ARGV[1]) then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
return 1
`;

export const authStore = {
  async saveRefreshToken(jti: string, ttlSeconds: number): Promise<void> {
    await redis.set(key('refresh', jti), '1', 'EX', ttlSeconds);
  },

  async useRefreshToken(jti: string, graceSeconds: number): Promise<boolean> {
    const result = await redis.eval(USE_REFRESH_TOKEN_SCRIPT, 1, key('refresh', jti), graceSeconds);
    return result === 1;
  },

  /** 이 시각(초) 이전에 발급된 토큰은 모두 무효입니다. */
  async getSessionsValidAfter(email: string): Promise<number> {
    const value = await redis.get(key('valid-after', email));
    return value ? Number(value) : 0;
  },

  async revokeSessions(email: string, nowSeconds: number, ttlSeconds: number): Promise<void> {
    await redis.set(key('valid-after', email), String(nowSeconds), 'EX', ttlSeconds);
  },

  /** 재발송 대기 시간을 시작합니다. 이미 대기 중이면 false를 반환합니다. */
  async startEmailCooldown(email: string, seconds: number): Promise<boolean> {
    const result = await redis.set(key('email-cooldown', email), '1', 'EX', seconds, 'NX');
    return result === 'OK';
  },

  async clearEmailCooldown(email: string): Promise<void> {
    await redis.del(key('email-cooldown', email));
  },

  /** 새 코드를 저장하고 이전 코드의 실패 횟수를 초기화합니다. */
  async saveEmailCode(email: string, code: string, ttlSeconds: number): Promise<void> {
    await redis
      .multi()
      .set(key('email-code', email), code, 'EX', ttlSeconds)
      .del(key('email-attempts', email))
      .exec();
  },

  async getEmailCode(email: string): Promise<string | null> {
    return redis.get(key('email-code', email));
  },

  /** 검증 시도 횟수를 1 늘리고 늘어난 값을 반환합니다. */
  async countEmailAttempt(email: string, ttlSeconds: number): Promise<number> {
    const attemptsKey = key('email-attempts', email);
    const results = await redis.multi().incr(attemptsKey).expire(attemptsKey, ttlSeconds).exec();
    const [incrError, count] = results?.[0] ?? [new Error('Redis transaction aborted'), 0];
    if (incrError) throw incrError;
    return Number(count);
  },

  async clearEmailCode(email: string): Promise<void> {
    await redis.del(key('email-code', email), key('email-attempts', email));
  },

  async markEmailVerified(email: string, ttlSeconds: number): Promise<void> {
    await redis.set(key('email-verified', email), '1', 'EX', ttlSeconds);
  },

  async isEmailVerified(email: string): Promise<boolean> {
    return (await redis.exists(key('email-verified', email))) === 1;
  },

  async clearEmailVerified(email: string): Promise<void> {
    await redis.del(key('email-verified', email));
  },
};

export type AuthStore = typeof authStore;
