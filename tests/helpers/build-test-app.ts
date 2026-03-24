/** 테스트용 Fastify 인스턴스를 생성합니다. (DB 연결 없이 라우트만 등록) */
import fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import authPlugin from '../../src/plugins/auth';
import errorHandlerPlugin from '../../src/plugins/error-handler';
import { healthRoutes } from '../../src/modules/health/health.route';
import { authRoutes } from '../../src/modules/auth/auth.route';
import { userRoutes } from '../../src/modules/user/user.route';
import { activityRoutes } from '../../src/modules/activity/activity.route';
import { organizationRoutes } from '../../src/modules/organization/organization.route';
import { attendanceRoutes } from '../../src/modules/attendance/attendance.route';
import { seasonRoutes } from '../../src/modules/season/season.route';
import { cronRoutes } from '../../src/modules/cron/cron.route';

export async function buildTestApp() {
  const app = fastify({ logger: false });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);
  await app.register(authPlugin);

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

  await app.ready();
  return app;
}
