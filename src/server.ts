/**
 * 서버 엔트리 포인트
 * 데이터베이스 연결을 확인하고 Fastify 서버를 시작합니다.
 */
import { buildApp } from './app';
import { env } from './config/env';
import { testConnection } from './db/index';
import { testRedisConnection } from './db/redis';
import { isMailConfigured } from './services/auth/mailer';
import { assertJwtSecretConfigured } from './services/auth/token.service';

async function main(): Promise<void> {
  const app = await buildApp();

  try {
    await testConnection();
    app.log.info(`Database connected (${env.nodeEnv})`);
  } catch (error) {
    app.log.error(error, 'Failed to connect to database');
    process.exit(1);
  }

  // 인증은 모든 API의 전제이므로 설정이 빠졌거나 Redis에 닿지 않으면 바로 종료한다
  try {
    assertJwtSecretConfigured();
    await testRedisConnection();
    app.log.info(`Redis connected (${env.redis.host}:${env.redis.port})`);
  } catch (error) {
    app.log.error(error, 'Auth is not ready');
    process.exit(1);
  }
  if (!isMailConfigured()) {
    app.log.warn('SENDER_EMAIL/SENDER_SECRET is not set — /auth/code will fail');
  }

  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
    app.log.info(`Server running on http://localhost:${env.port}`);
    app.log.info(`API docs available at http://localhost:${env.port}/api-docs`);
  } catch (error) {
    app.log.error(error, 'Failed to start server');
    process.exit(1);
  }
}

main();
