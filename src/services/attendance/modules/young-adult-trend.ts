/**
 * 청년예배 출석 트렌드 — 12월 첫째 주부터 현재까지의 주차별 출석 데이터를 반환합니다.
 */
import { and, count, eq, gte } from 'drizzle-orm';
import { db } from '../../../db';
import { activities } from '../../../db/schema/activity';
import { attendances } from '../../../db/schema/attendance';
import { ACTIVITY_TYPES, ATTENDANCE_STATUS } from '../../shared/constants';
import { getFirstSundayOfDecember } from '../../shared/date.util';

interface TrendDataPoint {
  xAxisName: string;
  count: number;
}

export interface YoungAdultTrendResult {
  weeklySundayYoungAdultAttendanceTrends: {
    xAxis: TrendDataPoint[];
    yAxisMax: number;
  };
}

/** 청년예배 주차별 출석 트렌드를 조회합니다. */
export async function getYoungAdultAttendanceTrend(): Promise<YoungAdultTrendResult> {
  const now = new Date();
  const targetYear = now.getMonth() === 11 ? now.getFullYear() : now.getFullYear() - 1;
  const firstSunday = getFirstSundayOfDecember(targetYear);

  const rows = await db
    .select({
      startTime: activities.startTime,
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
    .where(
      and(
        eq(activities.name, ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT),
        gte(activities.startTime, firstSunday),
      ),
    )
    .groupBy(activities.id, activities.startTime)
    .orderBy(activities.startTime);

  const sundayDates = generateSundayDates(firstSunday, now);

  const weeklyData: TrendDataPoint[] = sundayDates.map((sunday) => {
    const weekEnd = new Date(sunday);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const total = rows
      .filter((r) => {
        const d = new Date(r.startTime);
        return d >= sunday && d <= weekEnd;
      })
      .reduce((sum, r) => sum + Number(r.count), 0);

    const month = sunday.getMonth() + 1;
    const weekNumber = Math.ceil(
      (sunday.getDate() + new Date(sunday.getFullYear(), sunday.getMonth(), 0).getDay()) / 7,
    );

    return { xAxisName: `${month}월 ${weekNumber}주차`, count: total };
  });

  const maxCount = weeklyData.length > 0 ? Math.max(...weeklyData.map((d) => d.count)) : 0;
  const yAxisMax = Math.ceil(maxCount / 50) * 50;

  return {
    weeklySundayYoungAdultAttendanceTrends: { xAxis: weeklyData, yAxisMax },
  };
}

function generateSundayDates(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  return dates;
}
