/**
 * 글로벌 에러 핸들러 플러그인
 * Fastify의 setErrorHandler를 통해 모든 에러를 일관된 형식으로 응답합니다.
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

async function errorHandlerPlugin(app: FastifyInstance): Promise<void> {
  app.setErrorHandler((error: Error, _request: FastifyRequest, reply: FastifyReply) => {
    const log = app.log;

    if (error instanceof AppError) {
      log.warn({ err: error }, error.message);
      return reply.status(error.statusCode).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    if (error instanceof ZodError) {
      log.warn({ err: error }, 'Validation error');
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값이 올바르지 않습니다.',
          details: error.flatten(),
        },
      });
    }

    log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.',
      },
    });
  });
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
