/**
 * 주간 출석 집계 — 이번 주와 지난 주 비교 데이터를 생성합니다.
 * TODO: 결과 캐싱 고려 (1시간 TTL)
 */
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { db } from '../../../db';
import { attendances } from '../../../db/schema/attendance';
import { users } from '../../../db/schema/user';
import { userRoles } from '../../../db/schema/user-role';
import {
  get2WeeksAgoYoungAdultIds,
  getLastWeekYoungAdultIds,
} from '../../activity/activity.service';
import { getOrganizationIdsByGookAndGroup } from '../../organization/organization.service';
import { ATTENDANCE_STATUS } from '../../shared/constants';
import { daysAgo } from '../../shared/date.util';

export interface WeeklyAggregation {
  allMemberCount: number;
  weeklyAttendanceMemberCount: number;
  weeklyNewMemberCount: number;
  attendanceRate: number;
  lastWeek: {
    allMemberCount: number;
    weeklyAttendanceMemberCount: number;
    weeklyNewMemberCount: number;
    attendanceRate: number;
  };
}

/** 주간 출석 집계 데이터를 조회합니다 (병렬 쿼리로 성능 최적화). */
export async function getWeeklyAttendanceAggregation(
  gook?: string,
  group?: string,
  soon?: string,
): Promise<WeeklyAggregation> {
  const orgIds = await getOrganizationIdsByGookAndGroup(gook, group, soon);
  if (orgIds.length === 0) return emptyAggregation();

  const oneWeekAgo = daysAgo(7);
  const twoWeeksAgo = daysAgo(14);

  const [
    allMemberIds,
    lastWeekMemberIds,
    thisWeekActivityIds,
    lastWeekActivityIds,
    thisWeekNewMemberIds,
    lastWeekNewMemberIds,
  ] = await Promise.all([
    getMemberUserIds(orgIds),
    getMemberUserIds(orgIds, { createdBefore: oneWeekAgo }),
    getLastWeekYoungAdultIds(orgIds),
    get2WeeksAgoYoungAdultIds(orgIds),
    getNewMemberIds(orgIds, { since: oneWeekAgo }),
    getNewMemberIds(orgIds, { since: twoWeeksAgo, until: oneWeekAgo }),
  ]);

  const [thisWeekAttCount, lastWeekAttCount] = await Promise.all([
    countAttendance(allMemberIds, thisWeekActivityIds),
    countAttendance(lastWeekMemberIds, lastWeekActivityIds),
  ]);

  const rate = (attended: number, total: number) => (total > 0 ? (attended / total) * 100 : 0);

  return {
    allMemberCount: allMemberIds.length,
    weeklyAttendanceMemberCount: thisWeekAttCount,
    weeklyNewMemberCount: thisWeekNewMemberIds.length,
    attendanceRate: rate(thisWeekAttCount, allMemberIds.length),
    lastWeek: {
      allMemberCount: lastWeekMemberIds.length,
      weeklyAttendanceMemberCount: lastWeekAttCount,
      weeklyNewMemberCount: lastWeekNewMemberIds.length,
      attendanceRate: rate(lastWeekAttCount, lastWeekMemberIds.length),
    },
  };
}

// ── 내부 헬퍼 ──

async function getMemberUserIds(
  orgIds: number[],
  opts?: { createdBefore?: Date },
): Promise<number[]> {
  const conditions = [inArray(userRoles.organizationId, orgIds)];
  if (opts?.createdBefore) conditions.push(lt(userRoles.createdAt, opts.createdBefore));

  const rows = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(and(...conditions));
  return rows.map((r) => r.userId);
}

async function getNewMemberIds(
  orgIds: number[],
  opts: { since: Date; until?: Date },
): Promise<number[]> {
  const dateConditions = [gte(users.registrationDate, opts.since)];
  if (opts.until) dateConditions.push(lt(users.registrationDate, opts.until));

  const rows = await db
    .select({ userId: users.id })
    .from(userRoles)
    .innerJoin(
      users,
      and(eq(userRoles.userId, users.id), eq(users.isNewMember, true), ...dateConditions),
    )
    .where(inArray(userRoles.organizationId, orgIds));
  return rows.map((r) => r.userId);
}

async function countAttendance(userIds: number[], activityIds: number[]): Promise<number> {
  if (userIds.length === 0 || activityIds.length === 0) return 0;

  const rows = await db
    .select({ id: attendances.id })
    .from(attendances)
    .where(
      and(
        inArray(attendances.userId, userIds),
        inArray(attendances.activityId, activityIds),
        eq(attendances.attendanceStatus, ATTENDANCE_STATUS.PRESENT),
      ),
    );
  return rows.length;
}

function emptyAggregation(): WeeklyAggregation {
  return {
    allMemberCount: 0,
    weeklyAttendanceMemberCount: 0,
    weeklyNewMemberCount: 0,
    attendanceRate: 0,
    lastWeek: {
      allMemberCount: 0,
      weeklyAttendanceMemberCount: 0,
      weeklyNewMemberCount: 0,
      attendanceRate: 0,
    },
  };
}
