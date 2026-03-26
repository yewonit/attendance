/** 역할 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { boolean, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { rolePermissions } from './role-permission';
import { userRoles } from './user-role';

export const roles = mysqlTable('role', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 20 }).notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
  sortOrder: int('sort_order').notNull().default(0),
  /** 역할 우선순위 레벨 (낮을수록 우선순위 높음) */
  level: int('level'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));
