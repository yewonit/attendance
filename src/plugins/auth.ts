/**
 * 인증 플러그인
 * Authorization 헤더에서 Bearer 토큰을 추출하고 외부 인증 서버를 통해 검증합니다.
 * TODO: 외부 인증 서버 연동 로직 구현
 */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../utils/errors';

export interface AuthUser {
  email: string;
  name: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    auth?: AuthUser;
  }
}

async function authPlugin(app: FastifyInstance): Promise<void> {
  /** Bearer 토큰을 추출하고 검증하는 데코레이터 */
  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', '인증 토큰이 필요합니다.', 401);
    }

    const token = authHeader.slice(7);
    if (!token) {
      throw new AppError('UNAUTHORIZED', '유효하지 않은 토큰입니다.', 401);
    }

    // TODO: 외부 인증 서버(AUTH_SERVER_HOST)를 통한 토큰 검증 구현
    // const user = await verifyWithToken(token);
    // request.auth = user;
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(authPlugin, { name: 'auth' });
