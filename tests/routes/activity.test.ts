import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/activity/activity.service', () => ({
  getActivityTemplates: vi.fn().mockReturnValue([{ id: 1, name: '청년예배' }]),
  getAllOrganizationActivities: vi.fn().mockResolvedValue([{ id: 1, name: '청년예배' }]),
  getActivityDetails: vi.fn().mockResolvedValue({ id: 1, name: '청년예배', attendances: [], images: [] }),
  recordActivityAndAttendance: vi.fn().mockResolvedValue(undefined),
  updateActivityAndAttendance: vi.fn().mockResolvedValue(undefined),
  deleteActivityAndAttendance: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../src/services/auth/auth.service', () => ({ verifyWithToken: vi.fn() }));
vi.mock('../../src/services/user/user-role.service', () => ({ getUserRolesOfCurrentSeason: vi.fn(), getAccessibleOrganizations: vi.fn(), changeOrganization: vi.fn(), UserRoleInfo: {} }));
vi.mock('../../src/services/user/user.service', () => ({ setEmailAndPassword: vi.fn(), emailDuplicationCheck: vi.fn(), checkUserNameExists: vi.fn(), checkUserPhoneNumber: vi.fn(), findUserById: vi.fn(), findAllUsers: vi.fn(), searchMembersByName: vi.fn(), createUser: vi.fn(), createUsers: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock('../../src/services/user/user-filter.service', () => ({ getMembersWithFilters: vi.fn(), getAllNewMembers: vi.fn() }));
vi.mock('../../src/services/permission/permission.service', () => ({ getUserPermissionCodes: vi.fn() }));
vi.mock('../../src/services/organization/organization.service', () => ({ findOrganizations: vi.fn(), findOrganizationById: vi.fn(), createOrganization: vi.fn(), updateOrganization: vi.fn(), deleteOrganization: vi.fn(), getOrganizationMembers: vi.fn(), getMembersWithRoles: vi.fn(), getAllOrganizationMemberCounts: vi.fn(), getFilterOptions: vi.fn() }));
vi.mock('../../src/services/attendance/attendance.service', () => ({ getWeeklyAttendanceAggregation: vi.fn(), getWeeklyAttendanceGraph: vi.fn(), getContinuousMembers: vi.fn(), getYoungAdultAttendanceTrend: vi.fn(), getRecentSundayAttendance: vi.fn(), recentSundayAttendanceToExcel: vi.fn(), getRecentWednesdayAttendance: vi.fn(), recentWednesdayAttendanceToExcel: vi.fn() }));
vi.mock('../../src/services/season/season.service', () => ({ getNextOrganization: vi.fn(), getAllNationsOrgList: vi.fn(), getCurrentSeasonId: vi.fn() }));
vi.mock('../../src/services/season/modules/create-new-season', () => ({ createNewSeason: vi.fn() }));
vi.mock('../../src/services/season/modules/create-organization-and-user-role', () => ({ createOrganizationAndUserRole: vi.fn() }));
vi.mock('../../src/services/season/modules/delete-before-create', () => ({ deleteBeforeCreateOrganization: vi.fn() }));
vi.mock('../../src/services/season/modules/validate', () => ({ validateNewSeasonData: vi.fn().mockImplementation((d: unknown) => d) }));
vi.mock('../../src/services/user/user-cron.service', () => ({ resetExpiredNewMembers: vi.fn(), updateLongTermAbsenteeStatus: vi.fn() }));
vi.mock('../../src/db', () => ({ db: { transaction: vi.fn().mockImplementation(async (fn: Function) => fn({})) }, pool: { execute: vi.fn() } }));
vi.mock('../../src/utils/password', () => ({ hashPassword: vi.fn(), verifyPassword: vi.fn() }));

let app: FastifyInstance;
beforeAll(async () => { app = await buildTestApp(); });
afterAll(async () => { await app.close(); });

describe('Activity Routes', () => {
  describe('GET /api/activities/templates', () => {
    it('{data, error: null} 형식으로 템플릿을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/activities/templates' });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('error', null);
    });
  });

  describe('GET /api/activities', () => {
    it('organizationId 쿼리로 활동 목록을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/activities?organizationId=1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(res.json()).toHaveProperty('error', null);
    });
  });

  describe('POST /api/activities', () => {
    it('활동을 생성하고 201 {data: success, error: null}을 반환한다', async () => {
      const res = await app.inject({ method: 'POST', url: '/api/activities?organizationId=1&activityTemplateId=1', payload: { activityData: { startDateTime: '2025-01-05T05:30:00Z', endDateTime: '2025-01-05T07:30:00Z' }, attendances: [] } });
      expect(res.statusCode).toBe(201);
      expect(res.json()).toEqual({ data: 'success', error: null });
    });
  });

  describe('GET /api/activities/:id', () => {
    it('활동 상세를 {data, error: null}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/activities/1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(res.json()).toHaveProperty('error', null);
    });
  });

  describe('PUT /api/activities/:id', () => {
    it('활동 수정 후 {data: success, error: null}을 반환한다', async () => {
      const res = await app.inject({ method: 'PUT', url: '/api/activities/1', payload: { activityData: { startDateTime: '2025-01-05T05:30:00Z', endDateTime: '2025-01-05T07:30:00Z' }, attendances: [] } });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ data: 'success', error: null });
    });
  });

  describe('DELETE /api/activities/:id', () => {
    it('활동 삭제 후 {data: success, error: null}을 반환한다', async () => {
      const res = await app.inject({ method: 'DELETE', url: '/api/activities/1' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ data: 'success', error: null });
    });
  });
});
