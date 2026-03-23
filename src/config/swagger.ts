import fastifySwagger from '@fastify/swagger';
import scalarReference from '@scalar/fastify-api-reference';
/**
 * Swagger/OpenAPI 설정
 * @scalar/fastify-api-reference 를 사용하여 최신 UI로 API 문서를 제공합니다.
 */
import type { FastifyInstance } from 'fastify';
import { env } from './env';

/** Fastify 인스턴스에 Swagger 플러그인을 등록합니다. */
export async function registerSwagger(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Attendance API',
        description: '출석 관리 시스템 API',
        version: '2.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.port}`,
          description: 'Local server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(scalarReference, {
    routePrefix: '/api-docs',
  });
}
