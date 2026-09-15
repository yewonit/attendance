/** 인증 플러그인 — Bearer 토큰을 추출하고 외부 인증 서버를 통해 검증합니다. */
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { verifyWithToken } from '../services/auth/auth.service';
import { getUserPermissionCodesByEmail } from '../services/permission/permission.service';
import { AppError, ForbiddenError } from '../utils/errors';

export interface AuthUser {
  email: string;
  name: string;
}

type PreHandler = (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

declare module 'fastify' {
  interface FastifyRequest {
    auth: AuthUser;
  }
  interface FastifyInstance {
    authenticate: PreHandler;
    /** 인증된 사용자가 권한 코드를 가지고 있는지 검사하는 preHandler를 만듭니다. (authenticate 뒤에 등록) */
    requirePermission: (code: string) => PreHandler;
  }
}

async function authPlugin(app: FastifyInstance): Promise<void> {
  app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', '인증 토큰이 필요합니다.', 401);
    }

    const token = authHeader.slice(7);
    if (!token) {
      throw new AppError('UNAUTHORIZED', '유효하지 않은 토큰입니다.', 401);
    }

    const user = await verifyWithToken(token);
    request.auth = { email: user.email, name: user.name };
  });

  app.decorate('requirePermission', (code: string): PreHandler => {
    return async (request: FastifyRequest, _reply: FastifyReply) => {
      if (!request.auth) {
        throw new AppError('UNAUTHORIZED', '인증 토큰이 필요합니다.', 401);
      }

      const codes = await getUserPermissionCodesByEmail(request.auth.email);
      if (!codes.includes(code)) {
        throw new ForbiddenError();
      }
    };
  });
}

export default fp(authPlugin, { name: 'auth' });
