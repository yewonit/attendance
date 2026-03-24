/**
 * 주간 출석 그래프 데이터 — 국/그룹/순별 각 예배 출석 수와 합계/연간 평균을 반환합니다.
 */
import { and, count, eq, gt, inArray, sql } from 'drizzle-orm';
import { db } from '../../../db';
import { activities } from '../../../db/schema/activity';
import { attendances } from '../../../db/schema/attendance';
import { getOrganizationsByGookAndGroup } from '../../organization/organization.service';
import { ACTIVITY_TYPES, ATTENDANCE_STATUS } from '../../shared/constants';
import { daysAgo } from '../../shared/date.util';

interface ServiceData {
  sunday: number;
  sundayYoungAdult: number;
  wednesdayYoungAdult: number;
  fridayYoungAdult: number;
}

function emptyServiceData(): ServiceData {
  return { sunday: 0, sundayYoungAdult: 0, wednesdayYoungAdult: 0, fridayYoungAdult: 0 };
}

/** 활동명 → ServiceData 키 매핑 */
function getServiceKey(activityName: string): keyof ServiceData | null {
  if (activityName === ACTIVITY_TYPES.SUNDAY_2 || activityName === ACTIVITY_TYPES.SUNDAY)
    return 'sunday';
  if (activityName === ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT) return 'sundayYoungAdult';
  if (activityName === ACTIVITY_TYPES.WEDNESDAY_YOUNG_ADULT) return 'wednesdayYoungAdult';
  if (activityName === ACTIVITY_TYPES.FRIDAY_YOUNG_ADULT) return 'fridayYoungAdult';
  return null;
}

export interface WeeklyGraphResult {
  attendanceXAxis: string[];
  attendanceYAxisMax: number;
  attendanceCounts: ServiceData[];
  attendanceAggregationSum: ServiceData;
  attendanceAggregationAverage: ServiceData;
}

/** 주간 출석 그래프 데이터를 조회합니다. */
export async function getWeeklyAttendanceGraph(
  gook?: string,
  group?: string,
  soon?: string,
): Promise<WeeklyGraphResult> {
  let orgs = await getOrganizationsByGookAndGroup(gook, group, soon);
  orgs = orgs.filter((o) => o.name.endsWith('순'));

  const orgIds = orgs.map((o) => o.id);
  if (orgIds.length === 0) {
    return {
      attendanceXAxis: [],
      attendanceYAxisMax: 50,
      attendanceCounts: [],
      attendanceAggregationSum: emptyServiceData(),
      attendanceAggregationAverage: emptyServiceData(),
    };
  }

  const oneWeekAgo = daysAgo(7);

  const rows = await db
    .select({
      organizationId: activities.organizationId,
      name: activities.name,
      count: count(attendances.id),
    })
    .from(activities)
    .innerJoin(
      attendances,
      and(
        eq(attendances.activityId, activities.id),
        eq(attendances.attendanceStatus, ATTENDANCE_STATUS.PRESENT),
      ),
    )
    .where(and(inArray(activities.organizationId, orgIds), gt(activities.startTime, oneWeekAgo)))
    .groupBy(activities.id, activities.organizationId, activities.name);

  const orgNameMap = new Map(orgs.map((o) => [o.id, o.name]));

  const orgAttMap = new Map<number, { name: string; count: number }[]>();
  for (const r of rows) {
    const list = orgAttMap.get(r.organizationId) ?? [];
    list.push({ name: r.name, count: Number(r.count) });
    orgAttMap.set(r.organizationId, list);
  }

  let attendanceXAxis: string[] = [];
  let attendanceCounts: ServiceData[] = [];

  if (!gook && !group) {
    ({ attendanceXAxis, attendanceCounts } = aggregateByGook(rows, orgNameMap));
  } else if (gook && !group) {
    ({ attendanceXAxis, attendanceCounts } = aggregateByGroup(rows, orgNameMap));
  } else {
    ({ attendanceXAxis, attendanceCounts } = aggregateBySoon(orgIds, orgs, orgAttMap));
  }

  const sum = emptyServiceData();
  for (const r of rows) {
    const key = getServiceKey(r.name);
    if (key) sum[key] += Number(r.count);
  }

  const average = await getAnnualAttendanceAverage(orgIds);

  const yMax =
    attendanceCounts.length > 0
      ? Math.ceil(
          Math.max(
            ...attendanceCounts.map((d) =>
              Math.max(d.sunday, d.sundayYoungAdult, d.wednesdayYoungAdult, d.fridayYoungAdult),
            ),
          ) / 50,
        ) *
          50 +
        50
      : 50;

  return {
    attendanceXAxis,
    attendanceYAxisMax: yMax,
    attendanceCounts,
    attendanceAggregationSum: sum,
    attendanceAggregationAverage: average,
  };
}

// ── 집계 전략 ──

function aggregateByGook(
  rows: { organizationId: number; name: string; count: number }[],
  orgNameMap: Map<number, string>,
) {
  const map = new Map<string, ServiceData>();

  for (const r of rows) {
    const orgName = orgNameMap.get(r.organizationId) ?? '';
    const match = orgName.match(/^([가-힣0-9A-Za-z]+국)/);
    if (!match) continue;
    const gookName = match[1];
    if (!map.has(gookName)) map.set(gookName, emptyServiceData());
    const data = map.get(gookName) ?? emptyServiceData();
    const key = getServiceKey(r.name);
    if (key) data[key] += Number(r.count);
  }

  const xAxis = [...map.keys()].sort(sortGook);
  return {
    attendanceXAxis: xAxis,
    attendanceCounts: xAxis.map((k) => map.get(k) ?? emptyServiceData()),
  };
}

function aggregateByGroup(
  rows: { organizationId: number; name: string; count: number }[],
  orgNameMap: Map<number, string>,
) {
  const map = new Map<string, ServiceData>();

  for (const r of rows) {
    const orgName = orgNameMap.get(r.organizationId) ?? '';
    const match = orgName.match(/^(\d+국_[^_]+그룹)/);
    if (!match) continue;
    const groupName = match[1];
    if (!map.has(groupName)) map.set(groupName, emptyServiceData());
    const data = map.get(groupName) ?? emptyServiceData();
    const key = getServiceKey(r.name);
    if (key) data[key] += Number(r.count);
  }

  const xAxis = [...map.keys()].sort();
  return {
    attendanceXAxis: xAxis,
    attendanceCounts: xAxis.map((k) => map.get(k) ?? emptyServiceData()),
  };
}

function aggregateBySoon(
  orgIds: number[],
  orgs: { id: number; name: string }[],
  orgAttMap: Map<number, { name: string; count: number }[]>,
) {
  const xAxis: string[] = [];
  const counts: ServiceData[] = [];

  for (const id of orgIds) {
    const org = orgs.find((o) => o.id === id);
    if (org) xAxis.push(org.name);
    const data = emptyServiceData();
    const attList = orgAttMap.get(id) ?? [];
    for (const att of attList) {
      const key = getServiceKey(att.name);
      if (key) data[key] = att.count;
    }
    counts.push(data);
  }

  return { attendanceXAxis: xAxis, attendanceCounts: counts };
}

// ── 연간 평균 ──

async function getAnnualAttendanceAverage(orgIds: number[]): Promise<ServiceData> {
  const oneYearAgo = daysAgo(365);

  const rows = await db
    .select({
      name: activities.name,
      activityDate: sql<string>`DATE(${activities.startTime})`,
      count: count(attendances.id),
    })
    .from(activities)
    .innerJoin(
      attendances,
      and(
        eq(attendances.activityId, activities.id),
        eq(attendances.attendanceStatus, ATTENDANCE_STATUS.PRESENT),
      ),
    )
    .where(and(inArray(activities.organizationId, orgIds), gt(activities.startTime, oneYearAgo)))
    .groupBy(activities.name, sql`DATE(${activities.startTime})`);

  const buckets: Record<keyof ServiceData, number[]> = {
    sunday: [],
    sundayYoungAdult: [],
    wednesdayYoungAdult: [],
    fridayYoungAdult: [],
  };

  for (const r of rows) {
    const key = getServiceKey(r.name);
    if (key) buckets[key].push(Number(r.count));
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length);

  return {
    sunday: avg(buckets.sunday),
    sundayYoungAdult: avg(buckets.sundayYoungAdult),
    wednesdayYoungAdult: avg(buckets.wednesdayYoungAdult),
    fridayYoungAdult: avg(buckets.fridayYoungAdult),
  };
}

// ── 정렬 ──

function sortGook(a: string, b: string): number {
  const aStr = a.replace('국', '');
  const bStr = b.replace('국', '');
  const aNum = /^\d+/.test(aStr);
  const bNum = /^\d+/.test(bStr);
  if (aNum && bNum) return Number.parseInt(aStr) - Number.parseInt(bStr);
  if (aNum) return -1;
  if (bNum) return 1;
  return aStr.localeCompare(bStr);
}
