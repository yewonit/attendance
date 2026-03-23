/**
 * 헬스체크 라우트
 * 서버 및 데이터베이스 상태를 확인합니다.
 */
import type { FastifyInstance } from 'fastify';
import { testConnection } from '../../db/index';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/health-check',
    {
      schema: {
        tags: ['Health'],
        summary: '서버 상태 확인',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              database: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      let dbStatus = 'connected';
      try {
        await testConnection();
      } catch {
        dbStatus = 'disconnected';
      }

      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
      });
    },
  );
}
