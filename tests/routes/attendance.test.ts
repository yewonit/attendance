import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildTestApp } from '../helpers/build-test-app';

vi.mock('../../src/services/attendance/attendance.service', () => ({
  getWeeklyAttendanceAggregation: vi.fn().mockResolvedValue({ allMemberCount: 10, weeklyAttendanceMemberCount: 8, weeklyNewMemberCount: 1, attendanceRate: 80, lastWeek: { allMemberCount: 9, weeklyAttendanceMemberCount: 7, weeklyNewMemberCount: 0, attendanceRate: 77 } }),
  getWeeklyAttendanceGraph: vi.fn().mockResolvedValue({ attendanceXAxis: ['1국'], attendanceYAxisMax: 50, attendanceCounts: [], attendanceAggregationSum: {}, attendanceAggregationAverage: {} }),
  getContinuousMembers: vi.fn().mockResolvedValue({ absenteeList: {}, continuousAttendeeCount: {} }),
  getYoungAdultAttendanceTrend: vi.fn().mockResolvedValue({ weeklySundayYoungAdultAttendanceTrends: { xAxis: [], yAxisMax: 50 } }),
  getRecentSundayAttendance: vi.fn().mockResolvedValue([]),
  recentSundayAttendanceToExcel: vi.fn().mockResolvedValue(Buffer.from('xlsx-data')),
  getRecentWednesdayAttendance: vi.fn().mockResolvedValue([]),
  recentWednesdayAttendanceToExcel: vi.fn().mockResolvedValue(Buffer.from('xlsx-data')),
}));

vi.mock('../../src/services/auth/auth.service', () => ({ verifyWithToken: vi.fn() }));
vi.mock('../../src/services/user/user-role.service', () => ({ getUserRolesOfCurrentSeason: vi.fn(), getAccessibleOrganizations: vi.fn(), changeOrganization: vi.fn(), UserRoleInfo: {} }));
vi.mock('../../src/services/user/user.service', () => ({ setEmailAndPassword: vi.fn(), emailDuplicationCheck: vi.fn(), checkUserNameExists: vi.fn(), checkUserPhoneNumber: vi.fn(), findUserById: vi.fn(), findAllUsers: vi.fn(), searchMembersByName: vi.fn(), createUser: vi.fn(), createUsers: vi.fn(), updateUser: vi.fn(), deleteUser: vi.fn() }));
vi.mock('../../src/services/user/user-filter.service', () => ({ getMembersWithFilters: vi.fn(), getAllNewMembers: vi.fn() }));
vi.mock('../../src/services/permission/permission.service', () => ({ getUserPermissionCodes: vi.fn() }));
vi.mock('../../src/services/organization/organization.service', () => ({ findOrganizations: vi.fn(), findOrganizationById: vi.fn(), createOrganization: vi.fn(), updateOrganization: vi.fn(), deleteOrganization: vi.fn(), getOrganizationMembers: vi.fn(), getMembersWithRoles: vi.fn(), getAllOrganizationMemberCounts: vi.fn(), getFilterOptions: vi.fn() }));
vi.mock('../../src/services/activity/activity.service', () => ({ getActivityTemplates: vi.fn(), getAllOrganizationActivities: vi.fn(), getActivityDetails: vi.fn(), recordActivityAndAttendance: vi.fn(), updateActivityAndAttendance: vi.fn(), deleteActivityAndAttendance: vi.fn() }));
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

describe('Attendance Routes', () => {
  describe('GET /api/attendances/weekly', () => {
    it('gook/group/soon 쿼리로 {data, error: null}을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/weekly?gook=1&group=김' });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('error', null);
      expect(body.data).toHaveProperty('allMemberCount');
    });
  });

  describe('GET /api/attendances/graph', () => {
    it('그래프 데이터를 {data, error: null}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/graph?gook=1' });
      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('attendanceXAxis');
    });
  });

  describe('GET /api/attendances/continuous', () => {
    it('연속 출석/결석을 {data, error: null}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/continuous?gook=1&group=김&soon=이' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(res.json()).toHaveProperty('error', null);
    });
  });

  describe('GET /api/attendances/trend', () => {
    it('트렌드 데이터를 {data, error: null}로 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/trend' });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toHaveProperty('data');
      expect(res.json()).toHaveProperty('error', null);
    });
  });

  describe('GET /api/attendances/sunday/recent/excel', () => {
    it('엑셀 파일(xlsx)을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/sunday/recent/excel' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml');
      expect(res.headers['content-disposition']).toContain('recent_sunday_attendance.xlsx');
    });
  });

  describe('GET /api/attendances/wednesday/recent/excel', () => {
    it('엑셀 파일(xlsx)을 반환한다', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/attendances/wednesday/recent/excel' });
      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('spreadsheetml');
      expect(res.headers['content-disposition']).toContain('recent_wednesday_attendance.xlsx');
    });
  });
});
