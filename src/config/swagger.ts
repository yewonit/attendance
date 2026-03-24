/** Swagger/OpenAPI 설정 — Scalar UI + Zod 스키마 기반 자동 문서 생성 */
import fastifySwagger from '@fastify/swagger';
import scalarReference from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';
import { env } from './env';

export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    transform: jsonSchemaTransform,
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Attendance API',
        description: '출석 관리 시스템 API',
        version: '2.0.0',
      },
      servers: [{ url: `http://localhost:${env.port}`, description: 'Local server' }],
      tags: [
        { name: 'Health', description: '서버 상태 확인' },
        { name: 'Auth', description: '인증 관련 API' },
        { name: 'Users', description: '유저 관리 API' },
        { name: 'Activities', description: '활동 관리 API' },
        { name: 'Organizations', description: '조직 관리 API' },
        { name: 'Attendances', description: '출석 집계 API' },
        { name: 'Seasons', description: '회기 전환 관리 API' },
        { name: 'Cron', description: '크론 스케줄러 API' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });

  await app.register(scalarReference, { routePrefix: '/api-docs' });
}
