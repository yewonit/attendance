/** 시즌(회기) 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { boolean, datetime, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { organizations } from './organization';

export const seasons = mysqlTable('season', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 20 }).notNull(),
  startDate: datetime('start_date').notNull(),
  endDate: datetime('end_date').notNull(),
  endDelay: datetime('end_delay'),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const seasonsRelations = relations(seasons, ({ many }) => ({
  organizations: many(organizations),
}));
