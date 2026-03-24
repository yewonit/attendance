import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health-check', { schema: { tags: ['Health'] } }, async () => {
    return 'OK';
  });
}
