import { relations } from 'drizzle-orm';
/** 조직 테이블 스키마 (계층 구조 지원) */
import type { AnyMySqlColumn } from 'drizzle-orm/mysql-core';
import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { activities } from './activity';
import { seasons } from './season';
import { userRoles } from './user-role';

export const organizations = mysqlTable('organization', {
  id: int('id').primaryKey().autoincrement(),
  seasonId: int('season_id').references(() => seasons.id),
  name: varchar('name', { length: 50 }).notNull(),
  /** 상위 조직 ID — 조직 간 계층 구조를 나타냄 */
  upperOrganizationId: int('upper_organization_id').references(
    (): AnyMySqlColumn => organizations.id,
  ),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  season: one(seasons, {
    fields: [organizations.seasonId],
    references: [seasons.id],
  }),
  parent: one(organizations, {
    fields: [organizations.upperOrganizationId],
    references: [organizations.id],
    relationName: 'orgHierarchy',
  }),
  children: many(organizations, { relationName: 'orgHierarchy' }),
  activities: many(activities),
  userRoles: many(userRoles),
}));
