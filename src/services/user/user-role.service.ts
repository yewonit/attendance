/**
 * 사용자 역할 서비스
 * 현재 시즌 역할 조회, 접근 가능 조직, 조직 변경 등을 처리합니다.
 */
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { organizations } from '../../db/schema/organization';
import { roles } from '../../db/schema/role';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { NotFoundError } from '../../utils/errors';
import { getCurrentSeasonId } from '../season/season.service';
import { ADMIN_USER_IDS } from '../shared/constants';

export interface UserRoleInfo {
  roleName: string;
  roleLevel: number | null;
  organizationId: number;
  organizationName: string;
}

/** 사용자의 현재 시즌 역할 정보를 조회합니다. */
export async function getUserRolesOfCurrentSeason(userId: number): Promise<UserRoleInfo[]> {
  const seasonId = await getCurrentSeasonId();
  const isAdmin = (ADMIN_USER_IDS as readonly number[]).includes(userId);

  const conditions = [eq(userRoles.userId, userId), eq(organizations.seasonId, seasonId)];
  if (!isAdmin) {
    conditions.push(eq(roles.isDeleted, false), eq(organizations.isDeleted, false));
  }

  const rows = await db
    .select({
      roleName: roles.name,
      roleLevel: roles.level,
      orgId: organizations.id,
      orgName: organizations.name,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(organizations, eq(userRoles.organizationId, organizations.id))
    .where(and(...conditions));

  if (rows.length === 0) {
    throw new NotFoundError('해당 유저의 역할 정보');
  }

  return rows.map((r) => ({
    roleName: r.roleName,
    roleLevel: r.roleLevel,
    organizationId: r.orgId,
    organizationName: r.orgName,
  }));
}

/** 사용자의 역할에 따라 접근 가능한 조직 목록을 반환합니다. */
export async function getAccessibleOrganizations(email: string, name: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.name, name)))
    .limit(1);
  if (!user) throw new NotFoundError('User');

  const isAdmin = (ADMIN_USER_IDS as readonly number[]).includes(user.id);
  if (!isAdmin && user.isDeleted) throw new NotFoundError('User');

  const userRolesData = await getUserRolesOfCurrentSeason(user.id);
  if (userRolesData.length === 0) throw new NotFoundError('사용자의 역할 정보');

  const highestRole = userRolesData.reduce((best, cur) =>
    (cur.roleLevel ?? Number.POSITIVE_INFINITY) < (best.roleLevel ?? Number.POSITIVE_INFINITY)
      ? cur
      : best,
  );

  return getOrganizationsByRole(highestRole, user.id);
}

/** 사용자의 조직을 변경합니다. */
export async function changeOrganization(userId: number, newOrgId: number, roleName: string) {
  const seasonId = await getCurrentSeasonId();

  const [existingRole] = await db
    .select({ id: userRoles.id })
    .from(userRoles)
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .where(eq(userRoles.userId, userId))
    .limit(1);

  if (!existingRole) throw new NotFoundError('해당 유저의 역할');

  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, roleName))
    .limit(1);
  if (!role) throw new NotFoundError('Role', roleName);

  await db
    .update(userRoles)
    .set({ roleId: role.id, organizationId: newOrgId })
    .where(eq(userRoles.id, existingRole.id));
}

// ── 내부 헬퍼 ──

/** 역할에 따라 접근 가능한 조직 구조(국/그룹)를 반환합니다. */
async function getOrganizationsByRole(
  role: UserRoleInfo,
  userId: number,
): Promise<{ gook: string[]; group: string[][] }> {
  const seasonId = await getCurrentSeasonId();
  const isAdmin = (ADMIN_USER_IDS as readonly number[]).includes(userId);

  const orgConditions = [eq(organizations.seasonId, seasonId)];
  if (!isAdmin) orgConditions.push(eq(organizations.isDeleted, false));

  const allOrgs = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(and(...orgConditions));

  const orgNames = allOrgs.map((o) => {
    const [gook, group] = (o.name ?? '').split('_');
    return { gook, group };
  });

  const result: { gook: string[]; group: string[][] } = { gook: [], group: [] };

  // 순장/부그룹장 → 상위 조직(그룹장) 기준
  if (role.roleName === '순장' || role.roleName === '부그룹장') {
    const [currentOrg] = await db
      .select({ upperOrgId: organizations.upperOrganizationId })
      .from(organizations)
      .where(and(eq(organizations.id, role.organizationId), eq(organizations.seasonId, seasonId)))
      .limit(1);

    if (!currentOrg?.upperOrgId) return result;

    const orgWhere = [
      eq(organizations.id, currentOrg.upperOrgId),
      eq(organizations.seasonId, seasonId),
    ];
    if (!isAdmin) orgWhere.push(eq(organizations.isDeleted, false));

    const [upperOrg] = await db
      .select({ name: organizations.name })
      .from(organizations)
      .where(and(...orgWhere))
      .limit(1);

    if (!upperOrg) return result;

    const [gook, group] = (upperOrg.name ?? '').split('_');
    result.gook.push(gook.slice(0, -1));
    result.group.push([group.slice(0, -2)]);
    return result;
  }

  const [currentGook, currentGroup] = role.organizationName.split('_');

  switch (role.roleName) {
    case '그룹장':
      result.gook.push(currentGook.slice(0, -1));
      result.group.push([currentGroup.slice(0, -2)]);
      return result;

    case '부국장':
    case '국장': {
      result.gook.push(currentGook.slice(0, -1));
      const groups = [
        ...new Set(
          orgNames
            .filter((o) => o.gook === currentGook && o.group)
            .map((o) => o.group.slice(0, -2)),
        ),
      ];
      result.group.push(groups);
      return result;
    }

    case '회장단':
    case '교역자':
      for (const dto of orgNames) {
        if (dto.gook?.endsWith('국') && !result.gook.includes(dto.gook.slice(0, -1))) {
          result.gook.push(dto.gook.slice(0, -1));
          result.group.push([
            ...new Set(
              orgNames
                .filter((d) => d.gook === dto.gook && d.group)
                .map((d) => d.group.slice(0, -2)),
            ),
          ]);
        }
      }
      return result;

    default:
      return result;
  }
}
