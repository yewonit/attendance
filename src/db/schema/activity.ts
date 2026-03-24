/** 활동 테이블 스키마 */
import { relations } from 'drizzle-orm';
import {
  boolean,
  datetime,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { activityImages } from './activity-image';
import { attendances } from './attendance';
import { organizations } from './organization';

export const activities = mysqlTable('activity', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  activityCategory: varchar('activity_category', { length: 100 }).notNull(),
  location: varchar('location', { length: 100 }),
  organizationId: int('organization_id')
    .notNull()
    .references(() => organizations.id),
  startTime: datetime('start_time').notNull(),
  endTime: datetime('end_time').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [activities.organizationId],
    references: [organizations.id],
  }),
  images: many(activityImages),
  attendances: many(attendances),
}));
