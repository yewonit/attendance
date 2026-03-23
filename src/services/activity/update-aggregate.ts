/**
 * 출석 집계(UserAttendanceAggregate) 업데이트 헬퍼
 * 출석/결석 기록에 따라 연속 횟수 및 총 횟수를 업데이트합니다.
 */
import { and, eq } from 'drizzle-orm';
import type { db } from '../../db';
import { activities } from '../../db/schema/activity';
import { attendances } from '../../db/schema/attendance';
import { userAttendanceAggregates } from '../../db/schema/user-attendance-aggregate';
import { ATTENDANCE_STATUS } from '../shared/constants';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** 새 출석 기록 시 집계를 업데이트합니다. 집계가 없으면 새로 생성합니다. */
export async function updateUserAttendanceAggregate(
  tx: Tx,
  userId: number,
  activityType: string,
  attendanceStatus: string,
) {
  const existing = await tx
    .select()
    .from(userAttendanceAggregates)
    .where(
      and(
        eq(userAttendanceAggregates.userId, userId),
        eq(userAttendanceAggregates.activityType, activityType),
      ),
    )
    .limit(1);

  let aggregate = existing[0];

  if (!aggregate) {
    // 기존 출석 기록 기반으로 초기 카운트 계산
    const pastRows = await tx
      .select({ status: attendances.attendanceStatus })
      .from(attendances)
      .innerJoin(activities, eq(attendances.activityId, activities.id))
      .where(and(eq(attendances.userId, userId), eq(activities.name, activityType)));

    const totalAttend = pastRows.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const totalAbsence = pastRows.filter((r) => r.status === ATTENDANCE_STATUS.ABSENT).length;

    const [inserted] = await tx.insert(userAttendanceAggregates).values({
      userId,
      activityType,
      attendanceContinuousCount: 0,
      absenceContinuousCount: 0,
      totalAttendCount: totalAttend,
      totalAbsenceCount: totalAbsence,
      lastAction: null,
      lastOppositeContinuousCount: 0,
      isDisabled: false,
    });

    const created = await tx
      .select()
      .from(userAttendanceAggregates)
      .where(eq(userAttendanceAggregates.id, inserted.insertId))
      .limit(1);
    aggregate = created[0];
  }

  if (attendanceStatus === ATTENDANCE_STATUS.PRESENT) {
    await tx
      .update(userAttendanceAggregates)
      .set({
        attendanceContinuousCount: aggregate.attendanceContinuousCount + 1,
        totalAttendCount: aggregate.totalAttendCount + 1,
        absenceContinuousCount: 0,
        lastAction: attendanceStatus,
        lastOppositeContinuousCount: aggregate.absenceContinuousCount,
      })
      .where(eq(userAttendanceAggregates.id, aggregate.id));
  } else if (attendanceStatus === ATTENDANCE_STATUS.ABSENT) {
    await tx
      .update(userAttendanceAggregates)
      .set({
        absenceContinuousCount: aggregate.absenceContinuousCount + 1,
        totalAbsenceCount: aggregate.totalAbsenceCount + 1,
        attendanceContinuousCount: 0,
        lastAction: attendanceStatus,
        lastOppositeContinuousCount: aggregate.attendanceContinuousCount,
      })
      .where(eq(userAttendanceAggregates.id, aggregate.id));
  }
}

/** 출석 상태 변경 시 집계를 보정합니다. (이전 상태 → 새 상태 전환 처리) */
export async function updateAggregateWhenChanged(
  tx: Tx,
  userId: number,
  activityType: string,
  newStatus: string,
) {
  const existing = await tx
    .select()
    .from(userAttendanceAggregates)
    .where(
      and(
        eq(userAttendanceAggregates.userId, userId),
        eq(userAttendanceAggregates.activityType, activityType),
      ),
    )
    .limit(1);

  const aggregate = existing[0];
  if (!aggregate || newStatus === aggregate.lastAction) return;

  if (aggregate.lastAction === ATTENDANCE_STATUS.PRESENT) {
    await tx
      .update(userAttendanceAggregates)
      .set({
        attendanceContinuousCount: 0,
        absenceContinuousCount: (aggregate.lastOppositeContinuousCount ?? 0) + 1,
        totalAttendCount: aggregate.totalAttendCount - 1,
        totalAbsenceCount: aggregate.totalAbsenceCount + 1,
        lastAction: newStatus,
        lastOppositeContinuousCount: aggregate.attendanceContinuousCount - 1,
      })
      .where(eq(userAttendanceAggregates.id, aggregate.id));
  } else if (aggregate.lastAction === ATTENDANCE_STATUS.ABSENT) {
    await tx
      .update(userAttendanceAggregates)
      .set({
        attendanceContinuousCount: (aggregate.lastOppositeContinuousCount ?? 0) + 1,
        absenceContinuousCount: 0,
        totalAttendCount: aggregate.totalAttendCount + 1,
        totalAbsenceCount: aggregate.totalAbsenceCount - 1,
        lastAction: newStatus,
        lastOppositeContinuousCount: aggregate.absenceContinuousCount - 1,
      })
      .where(eq(userAttendanceAggregates.id, aggregate.id));
  }
}
