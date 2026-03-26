/**
 * 사용자 출석 집계 테이블 스키마
 * 사용자별 활동 유형에 따른 출석/결석 통계 및 연속 횟수를 관리합니다.
 */
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { users } from './user';

export const userAttendanceAggregates = mysqlTable('user_attendance_aggregate', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  activityType: varchar('activity_type', { length: 20 }).notNull(),
  attendanceContinuousCount: int('attendance_continuous_count').notNull().default(0),
  absenceContinuousCount: int('absence_continuous_count').notNull().default(0),
  totalAttendCount: int('total_attend_count').notNull().default(0),
  totalAbsenceCount: int('total_absence_count').notNull().default(0),
  lastAction: varchar('last_action', { length: 10 }),
  lastOppositeContinuousCount: int('last_opposite_continuous_count'),
  isDisabled: boolean('is_disabled').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const userAttendanceAggregatesRelations = relations(userAttendanceAggregates, ({ one }) => ({
  user: one(users, {
    fields: [userAttendanceAggregates.userId],
    references: [users.id],
  }),
}));
