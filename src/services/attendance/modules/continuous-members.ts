/**
 * 연속 출석/결석 현황 — 조직별 멤버들의 연속 출석자 및 결석자 리스트를 제공합니다.
 */
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../../../db';
import { roles } from '../../../db/schema/role';
import { users } from '../../../db/schema/user';
import { userAttendanceAggregates } from '../../../db/schema/user-attendance-aggregate';
import { userRoles } from '../../../db/schema/user-role';
import { getOrganizationsByGookAndGroup } from '../../organization/organization.service';
import { ACTIVITY_TYPES, ROLE_IDS, WEEK_THRESHOLDS } from '../../shared/constants';

interface UserInfo {
  name: string;
  role: string | null;
  organization: string | null;
}

interface WeeklyStats {
  '4weeks': UserInfo[];
  '3weeks': UserInfo[];
  '2weeks': UserInfo[];
}

export interface ContinuousMembersResult {
  absenteeList: WeeklyStats;
  continuousAttendeeCount: {
    sunday: WeeklyStats;
    sundayYoungAdult: WeeklyStats;
    wednesdayYoungAdult: WeeklyStats;
    fridayYoungAdult: WeeklyStats;
  };
}

/** 연속 출석/결석 현황을 조회합니다. */
export async function getContinuousMembers(
  gook?: string,
  group?: string,
  soon?: string,
): Promise<ContinuousMembersResult> {
  const orgs = await getOrganizationsByGookAndGroup(gook, group, soon);
  const orgIds = orgs.map((o) => o.id);
  if (orgIds.length === 0) return emptyResult();

  const orgNameMap = new Map(orgs.map((o) => [o.id, o.name]));

  const aggregateRows = await db
    .select({
      id: userAttendanceAggregates.id,
      userId: userAttendanceAggregates.userId,
      activityType: userAttendanceAggregates.activityType,
      attendanceContinuousCount: userAttendanceAggregates.attendanceContinuousCount,
      absenceContinuousCount: userAttendanceAggregates.absenceContinuousCount,
      userName: users.name,
      roleId: userRoles.roleId,
      roleName: roles.name,
      orgId: userRoles.organizationId,
    })
    .from(userAttendanceAggregates)
    .innerJoin(
      users,
      and(eq(userAttendanceAggregates.userId, users.id), eq(users.isDeleted, false)),
    )
    .innerJoin(
      userRoles,
      and(
        eq(userRoles.userId, users.id),
        inArray(userRoles.organizationId, orgIds),
        eq(userRoles.roleId, ROLE_IDS.MEMBER),
      ),
    )
    .innerJoin(roles, eq(userRoles.roleId, roles.id));

  const userMap = new Map<number, UserInfo>();
  for (const r of aggregateRows) {
    if (!userMap.has(r.userId)) {
      userMap.set(r.userId, {
        name: r.userName,
        role: r.roleName ?? null,
        organization: orgNameMap.get(r.orgId) ?? null,
      });
    }
  }

  const byType = {
    sunday: aggregateRows.filter((r) => r.activityType === ACTIVITY_TYPES.SUNDAY),
    sundayYoungAdult: aggregateRows.filter(
      (r) => r.activityType === ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT,
    ),
    wednesdayYoungAdult: aggregateRows.filter(
      (r) => r.activityType === ACTIVITY_TYPES.WEDNESDAY_YOUNG_ADULT,
    ),
    fridayYoungAdult: aggregateRows.filter(
      (r) => r.activityType === ACTIVITY_TYPES.FRIDAY_YOUNG_ADULT,
    ),
  };

  const resolveUser = (r: AggRow): UserInfo =>
    userMap.get(r.userId) ?? { name: '', role: null, organization: null };

  const buildAttendStats = (data: typeof aggregateRows): WeeklyStats => ({
    '4weeks': filterByField(
      data,
      'attendanceContinuousCount',
      WEEK_THRESHOLDS.FOUR_WEEKS,
      true,
    ).map(resolveUser),
    '3weeks': filterByField(
      data,
      'attendanceContinuousCount',
      WEEK_THRESHOLDS.THREE_WEEKS,
      false,
    ).map(resolveUser),
    '2weeks': filterByField(
      data,
      'attendanceContinuousCount',
      WEEK_THRESHOLDS.TWO_WEEKS,
      false,
    ).map(resolveUser),
  });

  const yaData = byType.sundayYoungAdult;
  const absenteeList: WeeklyStats = {
    '4weeks': filterByField(yaData, 'absenceContinuousCount', WEEK_THRESHOLDS.FOUR_WEEKS, true).map(
      resolveUser,
    ),
    '3weeks': filterByField(
      yaData,
      'absenceContinuousCount',
      WEEK_THRESHOLDS.THREE_WEEKS,
      false,
    ).map(resolveUser),
    '2weeks': filterByField(yaData, 'absenceContinuousCount', WEEK_THRESHOLDS.TWO_WEEKS, false).map(
      resolveUser,
    ),
  };

  return {
    absenteeList,
    continuousAttendeeCount: {
      sunday: buildAttendStats(byType.sunday),
      sundayYoungAdult: buildAttendStats(byType.sundayYoungAdult),
      wednesdayYoungAdult: buildAttendStats(byType.wednesdayYoungAdult),
      fridayYoungAdult: buildAttendStats(byType.fridayYoungAdult),
    },
  };
}

type AggRow = { userId: number; attendanceContinuousCount: number; absenceContinuousCount: number };

function filterByField(
  data: AggRow[],
  field: 'attendanceContinuousCount' | 'absenceContinuousCount',
  threshold: number,
  gte: boolean,
): AggRow[] {
  return data.filter((d) => (gte ? d[field] >= threshold : d[field] === threshold));
}

function emptyWeeklyStats(): WeeklyStats {
  return { '4weeks': [], '3weeks': [], '2weeks': [] };
}

function emptyResult(): ContinuousMembersResult {
  return {
    absenteeList: emptyWeeklyStats(),
    continuousAttendeeCount: {
      sunday: emptyWeeklyStats(),
      sundayYoungAdult: emptyWeeklyStats(),
      wednesdayYoungAdult: emptyWeeklyStats(),
      fridayYoungAdult: emptyWeeklyStats(),
    },
  };
}
