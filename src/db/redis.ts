/**
 * Redis 클라이언트
 * 인증 상태(리프레시 토큰, 세션 무효화 시각, 이메일 인증 코드)를 보관합니다.
 * 첫 명령 시점에 연결합니다(lazyConnect) — 테스트처럼 Redis를 쓰지 않는 경로에서는 연결하지 않습니다.
 */
import Redis from 'ioredis';
import { env } from '../config/env';

export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  lazyConnect: true,
  // Redis 장애 시 요청이 오래 매달리지 않고 빨리 실패하도록 재시도 횟수를 줄인다
  maxRetriesPerRequest: 2,
});

/** Redis 연결 테스트 */
export async function testRedisConnection(): Promise<void> {
  await redis.ping();
}
