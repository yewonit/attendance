import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { db } from '../../db';
import { users } from '../../db/schema/user';
import * as authService from '../../services/auth/auth.service';
import * as permissionService from '../../services/permission/permission.service';
import { getUserRolesOfCurrentSeason } from '../../services/user/user-role.service';
import {
  checkUserNameExists,
  checkUserPhoneNumber,
  emailDuplicationCheck,
  setEmailAndPassword,
} from '../../services/user/user.service';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { verifyPassword } from '../../utils/password';

const TAG = ['Auth'] as const;

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/register',
    {
      schema: {
        tags: [...TAG],
        summary: '이메일/비밀번호 최초 등록',
        body: z.object({ id: z.number(), email: z.string(), password: z.string() }),
      },
    },
    async (req) => {
      const { id, email, password } = req.body as { id: number; email: string; password: string };
      if (!id || !email || !password) {
        throw new BadRequestError(`필수 값이 누락되었습니다. id: ${id}, email: ${email}`);
      }
      await setEmailAndPassword(id, email, password);
      return { message: 'success' };
    },
  );

  app.post(
    '/login',
    {
      schema: {
        tags: [...TAG],
        summary: '이메일/비밀번호 로그인',
        body: z.object({ email: z.string(), password: z.string() }),
      },
    },
    async (req) => {
      const { email, password } = req.body as { email: string; password: string };

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user) throw new NotFoundError('해당 이메일로 유저를 찾을 수 없습니다.');
      if (!user.password) throw new BadRequestError('비밀번호가 설정되지 않은 계정입니다.');

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) throw new UnauthorizedError('패스워드가 일치하지 않습니다.');

      const [tokens, roles, permissions] = await Promise.all([
        authService.loginWithEmailAndPassword(email, user.name),
        getUserRolesOfCurrentSeason(user.id),
        permissionService.getUserPermissionCodes(user.id),
      ]);

      return {
        tokens,
        userData: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles,
          permissions,
        },
      };
    },
  );

  app.get(
    '/login',
    {
      schema: {
        tags: [...TAG],
        summary: '토큰 기반 로그인 상태 확인',
        security: [{ bearerAuth: [] }],
      },
    },
    async (req) => {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      if (!token) throw new UnauthorizedError('토큰이 필요합니다.');

      const data = await authService.verifyWithToken(token);
      const [user] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
      if (!user) throw new NotFoundError('User');

      const [roles, permissions] = await Promise.all([
        getUserRolesOfCurrentSeason(user.id),
        permissionService.getUserPermissionCodes(user.id),
      ]);

      return {
        userData: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roles,
          permissions,
        },
      };
    },
  );

  app.post(
    '/refresh',
    {
      schema: {
        tags: [...TAG],
        summary: '토큰 갱신',
        body: z.object({ refreshToken: z.string() }),
      },
    },
    async (req) => {
      const { refreshToken } = req.body as { refreshToken: string };
      return authService.refreshWithToken(refreshToken);
    },
  );

  app.post(
    '/code',
    {
      schema: {
        tags: [...TAG],
        summary: '이메일 인증 코드 발송',
        body: z.object({ email: z.string() }),
      },
    },
    async (req, reply) => {
      const { email } = req.body as { email: string };
      await authService.sendVerifyEmail(email);
      return reply.status(204).send();
    },
  );

  app.post(
    '/verify',
    {
      schema: {
        tags: [...TAG],
        summary: '이메일 인증 코드 확인',
        body: z.object({ email: z.string(), code: z.string() }),
      },
    },
    async (req) => {
      const { email, code } = req.body as { email: string; code: string };
      const isVerified = await authService.verifyEmailCode(email, code);
      if (!isVerified) throw new BadRequestError('이메일 검증에 실패했습니다.');
      return { isVerified };
    },
  );

  app.post(
    '/reset-password',
    {
      schema: {
        tags: [...TAG],
        summary: '비밀번호 재설정',
        body: z.object({ id: z.number(), password: z.string() }),
      },
    },
    async (req) => {
      const { id, password } = req.body as { id: number; password: string };
      await authService.resetPassword(id, password);
      return { result: 'success' };
    },
  );

  app.get(
    '/users/email',
    {
      schema: {
        tags: [...TAG],
        summary: '이메일 중복 확인',
        querystring: z.object({ email: z.string() }),
      },
    },
    async (req) => {
      const { email } = req.query as { email: string };
      await emailDuplicationCheck(email);
      return { message: '이메일 사용 가능', email };
    },
  );

  app.get(
    '/users/name',
    {
      schema: {
        tags: [...TAG],
        summary: '이름 존재 여부 확인',
        querystring: z.object({ name: z.string() }),
      },
    },
    async (req, reply) => {
      const { name } = req.query as { name: string };
      const exists = await checkUserNameExists(name);
      if (exists) return { message: '이름이 있습니다.' };
      return reply.status(404).send({ message: '이름이 없습니다.' });
    },
  );

  app.post(
    '/users/phone-number',
    {
      schema: {
        tags: [...TAG],
        summary: '이름+전화번호 본인 확인',
        body: z.object({ name: z.string(), phoneNumber: z.string() }),
      },
    },
    async (req) => {
      const { name, phoneNumber } = req.body as { name: string; phoneNumber: string };
      const userData = await checkUserPhoneNumber(name, phoneNumber);
      return { isMatched: true, userData };
    },
  );
}
