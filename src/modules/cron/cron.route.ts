import type { FastifyInstance } from 'fastify';
import {
  resetExpiredNewMembers,
  updateLongTermAbsenteeStatus,
} from '../../services/user/user-cron.service';

const TAG = ['Cron'] as const;

export async function cronRoutes(app: FastifyInstance) {
  app.put(
    '/users/new-members',
    {
      schema: { tags: [...TAG], summary: '새가족 상태 만료 처리' },
    },
    async () => {
      await resetExpiredNewMembers();
      return { message: 'success' };
    },
  );

  app.put(
    '/users/long-term-absentees',
    {
      schema: { tags: [...TAG], summary: '장결자 상태 갱신' },
    },
    async () => {
      await updateLongTermAbsenteeStatus();
      return { message: 'success' };
    },
  );
}
