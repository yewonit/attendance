/** 사용자 권한 조회 서비스 */
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { permissions } from '../../db/schema/permission';
import { roles } from '../../db/schema/role';
import { rolePermissions } from '../../db/schema/role-permission';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { NotFoundError } from '../../utils/errors';
import { ADMIN_USER_IDS } from '../shared/constants';

/** 사용자의 모든 권한 코드를 조회합니다 (역할을 통해 간접 획득). */
export async function getUserPermissionCodes(userId: number): Promise<string[]> {
  const isAdmin = (ADMIN_USER_IDS as readonly number[]).includes(userId);

  const userWhere = isAdmin
    ? eq(users.id, userId)
    : and(eq(users.id, userId), eq(users.isDeleted, false));

  const user = await db.select({ id: users.id }).from(users).where(userWhere).limit(1);
  if (user.length === 0) {
    throw new NotFoundError('User', userId);
  }

  const roleWhere = isAdmin ? undefined : eq(roles.isDeleted, false);

  const rows = await db
    .select({ code: permissions.code })
    .from(userRoles)
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), roleWhere))
    .innerJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, userId));

  const codes = new Set(rows.map((r) => r.code));
  return Array.from(codes);
}
