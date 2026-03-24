import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/season/season.service', () => ({
  getNextOrganization: vi.fn().mockResolvedValue([{ name: '테스트', organization: '1국_김그룹_이순' }]),
  getAllNationsOrgList: vi.fn().mockResolvedValue([{ id: 1, name: '237국_순1' }]),
  getCurrentSeasonId: vi.fn().mockResolvedValue(1),
}));
vi.mock('../../src/services/season/modules/create-new-season', () => ({ createNewSeason: vi.fn().mockResolvedValue(2) }));
vi.mock('../../src/services/season/modules/validate', () => ({ validateNewSeasonData: vi.fn().mockImplementation((d: unknown) => d) }));
vi.mock('../../src/services/season/modules/delete-before-create', () => ({ deleteBeforeCreateOrganization: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../src/services/season/modules/create-organization-and-user-role', () => ({ createOrganizationAndUserRole: vi.fn().mockResolvedValue(undefined) }));
vi.mock('../../src/services/user/user-cron.service', () => ({
  resetExpiredNewMembers: vi.fn().mockResolvedValue(undefined),
  updateLongTermAbsenteeStatus: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/services/auth/auth.service', () => ({ verifyWithToken: vi.fn() }));
vi.mock('../../src/services/user/user-role.service', () => ({ getUserRolesOfCurrentSeason: vi.fn(), getAccessibleOrganizations: vi.fn(), changeOrganization: vi.fn(), UserRoleInfo: {} }));
vi.mock('../../src/services/user/user.service', () => ({ setEmailAndPassword: vi.fn(), emailDuplicationCheck: vi.fn(), checkUserNameExists: vi.fn(), checkUserPhoneNumber: vi.fn(), findUserById: vi.fn(), findAllUsers: vi.fn(), searchMembersByName: vi.fn(), createUser: vi.fn(), createUsers: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock('../../src/services/user/user-filter.service', () => ({ getMembersWithFilters: vi.fn(), getAllNewMembers: vi.fn() }));
vi.mock('../../src/services/permission/permission.service', () => ({ getUserPermissionCodes: vi.fn() }));
vi.mock('../../src/services/organization/organization.service', () => ({ findOrganizations: vi.fn(), findOrganizationById: vi.fn(), createOrganization: vi.fn(), updateOrganization: vi.fn(), deleteOrganization: vi.fn(), getOrganizationMembers: vi.fn(), getMembersWithRoles: vi.fn(), getAllOrganizationMemberCounts: vi.fn(), getFilterOptions: vi.fn() }));
vi.mock('../../src/services/activity/activity.service', () => ({ getActivityTemplates: vi.fn(), getAllOrganizationActivities: vi.fn(), getActivityDetails: vi.fn(), recordActivityAndAttendance: vi.fn(), updateActivityAndAttendance: vi.fn(), deleteActivityAndAttendance: vi.fn() }));
vi.mock('../../src/services/attendance/attendance.service', () => ({ getWeeklyAttendanceAggregation: vi.fn(), getWeeklyAttendanceGraph: vi.fn(), getContinuousMembers: vi.fn(), getYoungAdultAttendanceTrend: vi.fn(), getRecentSundayAttendance: vi.fn(), recentSundayAttendanceToExcel: vi.fn(), getRecentWednesdayAttendance: vi.fn(), recentWednesdayAttendanceToExcel: vi.fn() }));
vi.mock('../../src/db', () => ({ db: { transaction: vi.fn().mockImplementation(async (fn: Function) => fn({})) }, pool: { execute: vi.fn() } }));
vi.mock('../../src/utils/password', () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }));

let app: FastifyInstance;
beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('Season Routes', () => {
  describe('POST /api/seasons', () => {
    it('회기 데이터 생성 후 201 {data: success}를 반환한다', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/seasons',
        payload: { data: [{ gook: '1국', group: '김그룹', soon: '이순', name: '테스트' }] },
      });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual({ data: 'success' });
    });
  });

  describe('GET /api/seasons/next', () => {
    it('name 쿼리로 다음 회기를 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/seasons/next?name=테스트' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });

  describe('GET /api/seasons/all-nations', () => {
    it('올네이션스 리스트를 {data}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/seasons/all-nations' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
    });
  });
});

describe('Cron Routes', () => {
  describe('PUT /api/cron-scheduler/users/new-members', () => {
    it('새가족 만료 처리 후 {message: success}를 반환한다', async () => {
      const res = await app.inject({ method: 'PUT', url: '/api/cron-scheduler/users/new-members' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ message: 'success' });
    });
  });

  describe('PUT /api/cron-scheduler/users/long-term-absentees', () => {
    it('장결자 갱신 후 {message: success}를 반환한다', async () => {
      const res = await app.inject({ method: 'PUT', url: '/api/cron-scheduler/users/long-term-absentees' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ message: 'success' });
    });
  });
});
