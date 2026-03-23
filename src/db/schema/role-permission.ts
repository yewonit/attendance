/** 역할-권한 매핑 테이블 스키마 */
import { relations } from 'drizzle-orm';
import { int, mysqlTable, timestamp } from 'drizzle-orm/mysql-core';
import { permissions } from './permission';
import { roles } from './role';

export const rolePermissions = mysqlTable('role_permission', {
  id: int('id').primaryKey().autoincrement(),
  roleId: int('role_id')
    .notNull()
    .references(() => roles.id),
  permissionId: int('permission_id')
    .notNull()
    .references(() => permissions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));
