/** 출석 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { activities } from './activity';
import { users } from './user';

export const attendances = mysqlTable('attendance', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  activityId: int('activity_id')
    .notNull()
    .references(() => activities.id),
  attendanceStatus: varchar('attendance_status', { length: 10 }).notNull(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const attendancesRelations = relations(attendances, ({ one }) => ({
  user: one(users, {
    fields: [attendances.userId],
    references: [users.id],
  }),
  activity: one(activities, {
    fields: [attendances.activityId],
    references: [activities.id],
  }),
}));
