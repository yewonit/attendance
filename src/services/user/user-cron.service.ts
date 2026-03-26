/**
 * 사용자 크론 작업 서비스
 * 새가족 상태 해제 및 장결자 판정 로직을 처리합니다.
 */
import { and, eq, inArray, lte } from 'drizzle-orm';
import { db } from '../../db';
import { users } from '../../db/schema/user';
import { userAttendanceAggregates } from '../../db/schema/user-attendance-aggregate';
import {
  ACTIVITY_TYPES,
  LONG_TERM_ABSENCE_THRESHOLD,
  NEW_MEMBER_DURATION_DAYS,
} from '../shared/constants';
import { daysAgo } from '../shared/date.util';

/**
 * 등록일로부터 28일이 지난 새가족의 is_new_member를 false로 변경합니다.
 * 크론 스케줄러에서 주기적으로 호출됩니다.
 */
export async function resetExpiredNewMembers(): Promise<void> {
  const cutoffDate = daysAgo(NEW_MEMBER_DURATION_DAYS);
  await db
    .update(users)
    .set({ isNewMember: false })
    .where(and(eq(users.isNewMember, true), lte(users.registrationDate, cutoffDate)));
}

/**
 * 장결자 상태를 갱신합니다.
 * - 청년예배 연속 결석 0회인 장결자 → 장결 해제
 * - 청년예배 연속 결석 4회인 비장결자 → 장결 설정
 */
export async function updateLongTermAbsenteeStatus(): Promise<void> {
  // 장결자 → 연속 결석 0회 → 해제
  const toUnset = await db
    .select({ userId: userAttendanceAggregates.userId })
    .from(userAttendanceAggregates)
    .innerJoin(
      users,
      and(eq(userAttendanceAggregates.userId, users.id), eq(users.isLongTermAbsentee, true)),
    )
    .where(
      and(
        eq(userAttendanceAggregates.activityType, ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT),
        eq(userAttendanceAggregates.absenceContinuousCount, 0),
      ),
    );

  if (toUnset.length > 0) {
    await db
      .update(users)
      .set({ isLongTermAbsentee: false })
      .where(
        inArray(
          users.id,
          toUnset.map((r) => r.userId),
        ),
      );
  }

  // 비장결자 → 연속 결석 4회 → 장결 설정
  const toSet = await db
    .select({ userId: userAttendanceAggregates.userId })
    .from(userAttendanceAggregates)
    .innerJoin(
      users,
      and(eq(userAttendanceAggregates.userId, users.id), eq(users.isLongTermAbsentee, false)),
    )
    .where(
      and(
        eq(userAttendanceAggregates.activityType, ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT),
        eq(userAttendanceAggregates.absenceContinuousCount, LONG_TERM_ABSENCE_THRESHOLD),
      ),
    );

  if (toSet.length > 0) {
    await db
      .update(users)
      .set({ isLongTermAbsentee: true })
      .where(
        inArray(
          users.id,
          toSet.map((r) => r.userId),
        ),
      );
  }
}
