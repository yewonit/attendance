import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/user/user.service', () => ({
  findUserById: vi.fn().mockResolvedValue({ id: 1, name: '테스트' }),
  findAllUsers: vi.fn().mockResolvedValue([{ id: 1, name: '테스트' }]),
  searchMembersByName: vi.fn().mockResolvedValue([{ id: 1, name: '테스트', roles: [] }]),
  createUser: vi.fn().mockResolvedValue(1),
  createUsers: vi.fn().mockResolvedValue([1, 2]),
  updateUser: vi.fn().mockResolvedValue(undefined),
  deleteUser: vi.fn().mockResolvedValue(undefined),
  setEmailAndPassword: vi.fn(),
  emailDuplicationCheck: vi.fn(),
  checkUserNameExists: vi.fn().mockResolvedValue(true),
  checkUserPhoneNumber: vi.fn().mockResolvedValue({ id: 1, name: '테스트' }),
}));

vi.mock('../../src/services/user/user-filter.service', () => ({
  getMembersWithFilters: vi.fn().mockResolvedValue({ members: [{ id: 1, name: '테스트' }], pagination: { currentPage: 1, totalPages: 1, totalCount: 1, limit: 10 } }),
  getAllNewMembers: vi.fn().mockResolvedValue([{ userId: 1, name: '새가족' }]),
}));

vi.mock('../../src/services/user/user-role.service', () => ({
  getAccessibleOrganizations: vi.fn().mockResolvedValue({ gook: ['1'], group: [['김']] }),
  changeOrganization: vi.fn().mockResolvedValue(undefined),
  getUserRolesOfCurrentSeason: vi.fn().mockResolvedValue([]),
  UserRoleInfo: {},
}));

vi.mock('../../src/services/auth/auth.service', () => ({
  verifyWithToken: vi.fn().mockResolvedValue({ email: 'test@test.com', name: '테스트' }),
}));

vi.mock('../../src/services/permission/permission.service', () => ({ getUserPermissionCodes: vi.fn() }));
vi.mock('../../src/db', () => ({ db: {}, pool: { execute: vi.fn() } }));
vi.mock('../../src/utils/password', () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }));

let app: FastifyInstance;
beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('User Routes', () => {
  describe('GET /api/users/new-members', () => {
    it('새가족 목록을 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users/new-members' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(Array.isArray(res.json().data)).toBe(true);
    });
  });

  describe('GET /api/users/search', () => {
    it('name 쿼리로 검색하여 {success, data}를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users/search?name=테스트' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('success', true);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('GET /api/users/accessible', () => {
    it('인증된 사용자의 접근 가능 조직을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users/accessible', headers: { authorization: 'Bearer faketoken' } });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('gook');
      expect(body).toHaveProperty('group');
    });
  });

  describe('PATCH /api/users/:id/change-organization', () => {
    it('조직 변경 후 {message: success}를 반환한다', async () => {
      const res = await app.inject({ method: 'PATCH', url: '/api/users/1/change-organization', payload: { organizationId: 2, roleName: '순원' } });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('message', 'success');
    });
  });

  describe('PATCH /api/users/bulk-change-organization', () => {
    it('일괄 조직 변경 후 {message: success}를 반환한다', async () => {
      const res = await app.inject({ method: 'PATCH', url: '/api/users/bulk-change-organization', payload: { data: [{ id: 1, organizationId: 2, roleName: '순원' }] } });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('message', 'success');
    });
  });

  describe('GET /api/users/:id', () => {
    it('ID로 사용자를 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users/1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('POST /api/users', () => {
    it('사용자를 생성하고 201을 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/users', payload: { userData: { name: '홍길동', gender: 'M', phone_number: '01012345678' }, organizationId: 1 } });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('POST /api/users/batch', () => {
    it('사용자 일괄 생성 후 201을 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/users/batch', payload: { users: [{ name: '홍길동', gender: 'M', organizationId: 1 }] } });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('GET /api/users (전체)', () => {
    it('쿼리 없이 전체 목록을 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('GET /api/users (필터)', () => {
    it('검색/필터 쿼리 시 {data: {members, pagination}}을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/users?search=테스트&page=1&limit=10' });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveProperty('members');
      expect(body.data).toHaveProperty('pagination');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('사용자 수정 후 200을 반환한다', async () => {
      const res = await app.inject({ method: 'PUT', url: '/api/users/1', payload: { userData: { name: '수정' } } });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('사용자 삭제 후 200을 반환한다', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/users/1' });
      expect(res.statusCode).toBe(200);
    });
  });
});
