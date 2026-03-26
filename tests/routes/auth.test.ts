import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/auth/auth.service', () => ({
  loginWithEmailAndPassword: vi.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
  verifyWithToken: vi.fn().mockResolvedValue({ email: 'test@test.com', name: '테스트' }),
  refreshWithToken: vi.fn().mockResolvedValue({ accessToken: 'at2', refreshToken: 'rt2' }),
  sendVerifyEmail: vi.fn().mockResolvedValue(undefined),
  verifyEmailCode: vi.fn().mockResolvedValue(true),
  resetPassword: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/services/permission/permission.service', () => ({
  getUserPermissionCodes: vi.fn().mockResolvedValue(['READ', 'WRITE']),
}));

vi.mock('../../src/services/user/user-role.service', () => ({
  getUserRolesOfCurrentSeason: vi.fn().mockResolvedValue([{ roleName: '순원', roleLevel: 5, organizationId: 1, organizationName: '1국_김그룹_이순' }]),
  getAccessibleOrganizations: vi.fn().mockResolvedValue({ gook: ['1'], group: [['김']] }),
  changeOrganization: vi.fn().mockResolvedValue(undefined),
  UserRoleInfo: {},
}));

vi.mock('../../src/services/user/user.service', () => ({
  setEmailAndPassword: vi.fn().mockResolvedValue(undefined),
  emailDuplicationCheck: vi.fn().mockResolvedValue(undefined),
  checkUserNameExists: vi.fn().mockResolvedValue(true),
  checkUserPhoneNumber: vi.fn().mockResolvedValue({ id: 1, name: '테스트', email: 'test@test.com', phoneNumber: '01012345678', roles: [] }),
  findUserById: vi.fn().mockResolvedValue({ id: 1, name: '테스트' }),
  findAllUsers: vi.fn().mockResolvedValue([]),
  searchMembersByName: vi.fn().mockResolvedValue([{ id: 1, name: '테스트' }]),
  createUser: vi.fn().mockResolvedValue(1),
  createUsers: vi.fn().mockResolvedValue([1, 2]),
  updateUser: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/db', () => ({
  db: { select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([{ id: 1, name: '테스트', email: 'test@test.com', phoneNumber: '01012345678', password: '$2b$10$hashedpassword' }]) }) }) }) },
  pool: { execute: vi.fn() },
}));

vi.mock('../../src/utils/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('$2b$10$hashed'),
  verifyPassword: vi.fn().mockResolvedValue(true),
}));

let app: FastifyInstance;

beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('id, email, password로 등록한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/register', payload: { id: 1, email: 'a@b.com', password: 'Pass1!' } });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /auth/login', () => {
    it('email, password로 로그인하여 tokens와 userData를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/login', payload: { email: 'test@test.com', password: 'Pass1!' } });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('tokens');
      expect(body).toHaveProperty('userData');
      expect(body.userData).toHaveProperty('id');
      expect(body.userData).toHaveProperty('name');
      expect(body.userData).toHaveProperty('email');
      expect(body.userData).toHaveProperty('phoneNumber');
      expect(body.userData).toHaveProperty('roles');
      expect(body.userData).toHaveProperty('permissions');
    });
  });

  describe('GET /auth/login', () => {
    it('Bearer 토큰으로 userData를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/auth/login', headers: { authorization: 'Bearer faketoken' } });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('userData');
    });
  });

  describe('POST /auth/refresh', () => {
    it('refreshToken으로 새 토큰을 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken: 'rt' } });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('accessToken');
      expect(body).toHaveProperty('refreshToken');
    });
  });

  describe('POST /auth/code', () => {
    it('이메일 인증 코드 발송 후 204를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/code', payload: { email: 'a@b.com' } });
      expect(res.statusCode).toBe(204);
    });
  });

  describe('POST /auth/verify', () => {
    it('코드 검증 후 isVerified를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/verify', payload: { email: 'a@b.com', code: '1234' } });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('isVerified', true);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('비밀번호 재설정 후 result를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/reset-password', payload: { id: 1, password: 'NewPass1!' } });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('result');
    });
  });

  describe('GET /auth/users/email', () => {
    it('이메일 중복 체크 결과를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/auth/users/email?email=a@b.com' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('message');
      expect(res.json()).toHaveProperty('email', 'a@b.com');
    });
  });

  describe('GET /auth/users/name', () => {
    it('이름이 존재하면 200을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/auth/users/name?name=테스트' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('message');
    });
  });

  describe('POST /auth/users/phone-number', () => {
    it('이름+전화번호 매칭 시 isMatched와 userData를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/auth/users/phone-number', payload: { name: '테스트', phoneNumber: '01012345678' } });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('isMatched', true);
      expect(body).toHaveProperty('userData');
    });
  });
});
