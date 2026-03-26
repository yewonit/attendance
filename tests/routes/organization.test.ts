import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/organization/organization.service', () => ({
  findOrganizations: vi.fn().mockResolvedValue([{ id: 1, name: '1국_김그룹_이순' }]),
  findOrganizationById: vi.fn().mockResolvedValue({ id: 1, name: '1국_김그룹_이순' }),
  createOrganization: vi.fn().mockResolvedValue(1),
  updateOrganization: vi.fn().mockResolvedValue(1),
  deleteOrganization: vi.fn().mockResolvedValue(1),
  getOrganizationMembers: vi.fn().mockResolvedValue([{ id: 1, name: '홍길동', roleName: '순원' }]),
  getMembersWithRoles: vi.fn().mockResolvedValue([{ userId: 1, name: '홍길동', roleName: '순원' }]),
  getAllOrganizationMemberCounts: vi.fn().mockResolvedValue([{ organizationId: 1, memberCount: 5 }]),
  getFilterOptions: vi.fn().mockResolvedValue({ departments: ['1국'], groups: ['김그룹'], teams: ['이순'] }),
}));

vi.mock('../../src/services/auth/auth.service', () => ({ verifyWithToken: vi.fn() }));
vi.mock('../../src/services/user/user-role.service', () => ({ getUserRolesOfCurrentSeason: vi.fn(), getAccessibleOrganizations: vi.fn(), changeOrganization: vi.fn(), UserRoleInfo: {} }));
vi.mock('../../src/services/user/user.service', () => ({ setEmailAndPassword: vi.fn(), emailDuplicationCheck: vi.fn(), checkUserNameExists: vi.fn(), checkUserPhoneNumber: vi.fn(), findUserById: vi.fn(), findAllUsers: vi.fn(), searchMembersByName: vi.fn(), createUser: vi.fn(), createUsers: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock('../../src/services/user/user-filter.service', () => ({ getMembersWithFilters: vi.fn(), getAllNewMembers: vi.fn() }));
vi.mock('../../src/services/permission/permission.service', () => ({ getUserPermissionCodes: vi.fn() }));
vi.mock('../../src/services/activity/activity.service', () => ({ getActivityTemplates: vi.fn(), getAllOrganizationActivities: vi.fn(), getActivityDetails: vi.fn(), recordActivityAndAttendance: vi.fn(), updateActivityAndAttendance: vi.fn(), deleteActivityAndAttendance: vi.fn() }));
vi.mock('../../src/services/attendance/attendance.service', () => ({ getWeeklyAttendanceAggregation: vi.fn(), getWeeklyAttendanceGraph: vi.fn(), getContinuousMembers: vi.fn(), getYoungAdultAttendanceTrend: vi.fn(), getRecentSundayAttendance: vi.fn(), recentSundayAttendanceToExcel: vi.fn(), getRecentWednesdayAttendance: vi.fn(), recentWednesdayAttendanceToExcel: vi.fn() }));
vi.mock('../../src/services/season/season.service', () => ({ getNextOrganization: vi.fn(), getAllNationsOrgList: vi.fn(), getCurrentSeasonId: vi.fn() }));
vi.mock('../../src/services/season/modules/create-new-season', () => ({ createNewSeason: vi.fn() }));
vi.mock('../../src/services/season/modules/create-organization-and-user-role', () => ({ createOrganizationAndUserRole: vi.fn() }));
vi.mock('../../src/services/season/modules/delete-before-create', () => ({ deleteBeforeCreateOrganization: vi.fn() }));
vi.mock('../../src/services/season/modules/validate', () => ({ validateNewSeasonData: vi.fn().mockImplementation((d: unknown) => d) }));
vi.mock('../../src/services/user/user-cron.service', () => ({ resetExpiredNewMembers: vi.fn(), updateLongTermAbsenteeStatus: vi.fn() }));
vi.mock('../../src/db', () => ({ db: { transaction: vi.fn() }, pool: { execute: vi.fn() } }));
vi.mock('../../src/utils/password', () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }));

let app: FastifyInstance;
beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('Organization Routes', () => {
  describe('GET /api/organizations/member-counts', () => {
    it('{data: [{organizationId, memberCount}]}를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations/member-counts' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(res.json().data[0]).toHaveProperty('organizationId');
      expect(res.json().data[0]).toHaveProperty('memberCount');
    });
  });

  describe('GET /api/organizations/:id/members', () => {
    it('{members}를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations/1/members' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('members');
    });
  });

  describe('GET /api/organizations/:id/members/roles', () => {
    it('역할 포함 멤버를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations/1/members/roles' });
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.json())).toBe(true);
    });
  });

  describe('POST /api/organizations', () => {
    it('조직 생성 후 201 {data}를 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/organizations', payload: { name: '테스트조직' } });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('GET /api/organizations (목록)', () => {
    it('전체 조직을 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('GET /api/organizations (필터옵션)', () => {
    it('filterOptions=true일 때 {data: {departments, groups, teams}}를 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations?filterOptions=true' });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data).toHaveProperty('departments');
      expect(body.data).toHaveProperty('groups');
      expect(body.data).toHaveProperty('teams');
    });
  });

  describe('GET /api/organizations/:id', () => {
    it('ID로 조직을 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/organizations/1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('PUT /api/organizations/:id', () => {
    it('조직 수정 후 200을 반환한다', async () => {
      const res = await app.inject({ method: 'PUT', url: '/api/organizations/1', payload: { name: '수정' } });
      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/organizations/:id', () => {
    it('조직 삭제 후 200을 반환한다', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/organizations/1' });
      expect(res.statusCode).toBe(200);
    });
  });
});
