/** 사용자-역할 매핑 (직분) 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { int, mysqlTable, timestamp } from 'drizzle-orm/mysql-core';
import { organizations } from './organization';
import { roles } from './role';
import { users } from './user';

export const userRoles = mysqlTable('user_role', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id')
    .notNull()
    .references(() => users.id),
  roleId: int('role_id')
    .notNull()
    .references(() => roles.id),
  organizationId: int('organization_id')
    .notNull()
    .references(() => organizations.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
  organization: one(organizations, {
    fields: [userRoles.organizationId],
    references: [organizations.id],
  }),
}));
