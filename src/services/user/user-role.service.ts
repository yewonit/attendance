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
import { BadRequestError, ConflictError, NotFoundError } from '../../utils/errors';
import { getCurrentSeasonId } from '../season/season.service';
import { ADMIN_USER_IDS, ASSIGNABLE_ROLE_NAMES } from '../shared/constants';
import { parseOrganizationName } from '../shared/organization-name.util';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export interface UserRoleInfo {
  roleName: string;
  roleLevel: number | null;
  organizationId: number;
  organizationName: string;
}

export interface OrganizationChange {
  userId: number;
  organizationId: number;
  roleName: string;
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

/** 사용자의 현재 회기 소속/직분을 변경합니다. */
export async function changeOrganization(userId: number, newOrgId: number, roleName: string) {
  await changeOrganizations([{ userId, organizationId: newOrgId, roleName }]);
}

/** 여러 사용자의 현재 회기 소속/직분을 한 트랜잭션으로 변경합니다. 하나라도 실패하면 전체 롤백됩니다. */
export async function changeOrganizations(changes: OrganizationChange[]) {
  if (changes.length === 0) throw new BadRequestError('변경할 사용자 목록이 비어있습니다.');

  const seasonId = await getCurrentSeasonId();
  await db.transaction(async (tx) => {
    for (const change of changes) {
      await applyOrganizationChange(tx, seasonId, change);
    }
  });
}

// ── 내부 헬퍼 ──

function isAssignableRoleName(roleName: string): boolean {
  return (ASSIGNABLE_ROLE_NAMES as readonly string[]).includes(roleName);
}

/**
 * 사용자 1명의 소속/직분 변경을 검증하고 반영합니다.
 * - 대상 조직: 현재 회기의 삭제되지 않은 순 단위 조직
 * - 직분: 변경 전/후 모두 ASSIGNABLE_ROLE_NAMES 에 속해야 함 (상위 직분 강등/승격 방지)
 * - 현재 회기 역할이 여러 개면 어떤 역할을 바꿀지 알 수 없으므로 거부
 */
async function applyOrganizationChange(
  tx: Tx,
  seasonId: number,
  { userId, organizationId, roleName }: OrganizationChange,
) {
  if (!isAssignableRoleName(roleName)) {
    throw new BadRequestError(`'${roleName}' 직분으로는 변경할 수 없습니다.`);
  }

  const [user] = await tx
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
    .limit(1);
  if (!user) throw new NotFoundError('User', userId);

  const [targetOrg] = await tx
    .select({ name: organizations.name })
    .from(organizations)
    .where(
      and(
        eq(organizations.id, organizationId),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .limit(1);
  if (!targetOrg || !parseOrganizationName(targetOrg.name).team) {
    throw new BadRequestError('현재 회기의 순 조직으로만 변경할 수 있습니다.');
  }

  const currentRoles = await tx
    .select({ id: userRoles.id, organizationId: userRoles.organizationId, roleName: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .where(eq(userRoles.userId, userId));

  if (currentRoles.length === 0) throw new NotFoundError('해당 유저의 역할');
  if (currentRoles.length > 1) {
    throw new ConflictError('현재 회기에 직분이 여러 개인 사용자는 소속을 변경할 수 없습니다.');
  }

  const [currentRole] = currentRoles;
  if (!isAssignableRoleName(currentRole.roleName)) {
    throw new BadRequestError(`현재 직분(${currentRole.roleName})은 소속 변경 대상이 아닙니다.`);
  }
  if (currentRole.organizationId === organizationId && currentRole.roleName === roleName) return;

  const [role] = await tx
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.name, roleName), eq(roles.isDeleted, false)))
    .limit(1);
  if (!role) throw new NotFoundError('Role', roleName);

  await tx
    .update(userRoles)
    .set({ roleId: role.id, organizationId })
    .where(eq(userRoles.id, currentRole.id));
}

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
