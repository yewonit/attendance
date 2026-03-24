/**
 * Fastify 앱 팩토리
 * 모든 플러그인과 라우트를 등록한 Fastify 인스턴스를 생성합니다.
 */
import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastify, { type FastifyInstance } from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { env } from './config/env';
import { registerSwagger } from './config/swagger';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';

import { activityRoutes } from './modules/activity/activity.route';
import { attendanceRoutes } from './modules/attendance/attendance.route';
import { authRoutes } from './modules/auth/auth.route';
import { cronRoutes } from './modules/cron/cron.route';
import { healthRoutes } from './modules/health/health.route';
import { organizationRoutes } from './modules/organization/organization.route';
import { seasonRoutes } from './modules/season/season.route';
import { userRoutes } from './modules/user/user.route';

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: {
      level: env.nodeEnv === 'production' ? 'info' : 'debug',
      transport:
        env.nodeEnv === 'local'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Zod 스키마 → JSON Schema 자동 변환 (Swagger + 요청 검증)
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // --- 핵심 플러그인 ---
  await app.register(fastifyCors, { origin: true, credentials: true });
  await app.register(fastifyCompress);
  await app.register(fastifyCookie);
  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);

  // --- API 문서 ---
  await registerSwagger(app);

  // --- 라우트 등록 ---
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(
    async (api) => {
      await api.register(userRoutes, { prefix: '/users' });
      await api.register(activityRoutes, { prefix: '/activities' });
      await api.register(attendanceRoutes, { prefix: '/attendances' });
      await api.register(organizationRoutes, { prefix: '/organizations' });
      await api.register(seasonRoutes, { prefix: '/seasons' });
      await api.register(cronRoutes, { prefix: '/cron-scheduler' });
    },
    { prefix: '/api' },
  );

  return app;
}
