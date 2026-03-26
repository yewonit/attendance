/**
 * 요청/응답 로깅 플러그인
 * - 요청 바디의 민감 필드를 마스킹하여 로깅
 * - 에러 발생 시 요청 컨텍스트를 포함한 구조화된 로그 출력
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

const SENSITIVE_FIELDS = new Set([
  'password',
  'token',
  'secret',
  'creditcard',
  'authorization',
  'refreshtoken',
]);

/** 객체 내 민감 필드를 재귀적으로 '[REDACTED]'로 치환합니다. */
function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitize(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function requestLoggerPlugin(app: FastifyInstance): Promise<void> {
  app.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
    const body = request.body ? sanitize(request.body) : undefined;
    const queryKeys = Object.keys((request.query as Record<string, unknown>) ?? {});

    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        responseTime: Math.round(reply.elapsedTime),
        ...(queryKeys.length > 0 ? { query: request.query } : {}),
        ...(body ? { body } : {}),
      },
      `${request.method} ${request.url} ${reply.statusCode} ${Math.round(reply.elapsedTime)}ms`,
    );

    done();
  });
}

export default fp(requestLoggerPlugin, { name: 'request-logger' });
export { sanitize };
