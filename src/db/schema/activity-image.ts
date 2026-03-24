/** 활동 이미지 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlTable, text, timestamp } from 'drizzle-orm/mysql-core';
import { activities } from './activity';

export const activityImages = mysqlTable('activity_image', {
  id: int('id').primaryKey().autoincrement(),
  activityId: int('activity_id')
    .notNull()
    .references(() => activities.id),
  name: text('name').notNull(),
  path: text('path').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const activityImagesRelations = relations(activityImages, ({ one }) => ({
  activity: one(activities, {
    fields: [activityImages.activityId],
    references: [activities.id],
  }),
}));
