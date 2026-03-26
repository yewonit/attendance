/** 조직 서비스 — CRUD, 멤버 조회, 필터 옵션, 멤버 수 집계 */
import { and, count, eq, like } from 'drizzle-orm';
import { db } from '../../db';
import { organizations } from '../../db/schema/organization';
import { roles } from '../../db/schema/role';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { NotFoundError } from '../../utils/errors';
import { getCurrentSeasonId } from '../season/season.service';
import {
  getOrganizationNamePattern,
  parseOrganizationName,
} from '../shared/organization-name.util';

// ── CRUD ──

/** 현재 시즌의 활성 조직 목록을 조회합니다. */
export async function findOrganizations() {
  const seasonId = await getCurrentSeasonId();
  return db
    .select()
    .from(organizations)
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)));
}

/** ID로 단일 조직을 조회합니다. */
export async function findOrganizationById(id: number) {
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  if (result.length === 0) throw new NotFoundError('Organization', id);
  return result[0];
}

/** 조직을 생성합니다. */
export async function createOrganization(data: {
  name: string;
  seasonId?: number;
  upperOrganizationId?: number;
}) {
  const seasonId = data.seasonId ?? (await getCurrentSeasonId());
  const [result] = await db.insert(organizations).values({
    name: data.name,
    seasonId,
    upperOrganizationId: data.upperOrganizationId ?? null,
  });
  return result.insertId;
}

/** 조직 정보를 수정합니다. */
export async function updateOrganization(
  id: number,
  data: Partial<{ name: string; upperOrganizationId: number }>,
) {
  const [result] = await db.update(organizations).set(data).where(eq(organizations.id, id));
  if (result.affectedRows === 0) throw new NotFoundError('Organization', id);
  return result.affectedRows;
}

/** 조직을 삭제합니다. */
export async function deleteOrganization(id: number) {
  const [result] = await db.delete(organizations).where(eq(organizations.id, id));
  if (result.affectedRows === 0) throw new NotFoundError('Organization', id);
  return result.affectedRows;
}

// ── 멤버 조회 ──

/** 조직의 멤버 목록을 간단히 조회합니다. */
export async function getOrganizationMembers(organizationId: number) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(users, and(eq(userRoles.userId, users.id), eq(users.isDeleted, false)))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.organizationId, organizationId));

  return rows;
}

/** 조직의 멤버와 상세 역할 정보를 조회합니다. */
export async function getMembersWithRoles(organizationId: number) {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      birthDate: users.birthDate,
      phoneNumber: users.phoneNumber,
      registrationDate: users.registrationDate,
      isNewMember: users.isNewMember,
      isLongTermAbsentee: users.isLongTermAbsentee,
      roleId: roles.id,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(users, and(eq(userRoles.userId, users.id), eq(users.isDeleted, false)))
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .where(eq(userRoles.organizationId, organizationId));

  return rows.map((r) => ({
    ...r,
    birthYear: r.birthDate ? new Date(r.birthDate).getFullYear().toString().slice(-2) : null,
    churchRegistrationDate: r.registrationDate,
  }));
}

// ── 집계/필터 ──

/** 모든 조직의 멤버 수를 한 번에 조회합니다. (단일 SQL) */
export async function getAllOrganizationMemberCounts() {
  const seasonId = await getCurrentSeasonId();

  const rows = await db
    .select({
      organizationId: organizations.id,
      memberCount: count(userRoles.userId),
    })
    .from(organizations)
    .leftJoin(userRoles, and(eq(organizations.id, userRoles.organizationId)))
    .leftJoin(users, and(eq(userRoles.userId, users.id), eq(users.isDeleted, false)))
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)))
    .groupBy(organizations.id)
    .orderBy(organizations.id);

  return rows.map((r) => ({
    organizationId: r.organizationId,
    memberCount: Number(r.memberCount),
  }));
}

/** 필터 옵션(소속국/소속그룹/소속순) 목록을 조회합니다. */
export async function getFilterOptions() {
  const seasonId = await getCurrentSeasonId();
  const orgs = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)))
    .orderBy(organizations.name);

  const deps = new Set<string>();
  const groups = new Set<string>();
  const teams = new Set<string>();

  for (const org of orgs) {
    const parsed = parseOrganizationName(org.name);
    if (parsed.department) deps.add(parsed.department);
    if (parsed.group) groups.add(parsed.group);
    if (parsed.team) teams.add(parsed.team);
  }

  return {
    departments: [...deps].sort(),
    groups: [...groups].sort(),
    teams: [...teams].sort(),
  };
}

// ── 내부 헬퍼 (다른 서비스에서도 사용) ──

/** 국/그룹/순 조건으로 조직 ID 목록을 조회합니다. */
export async function getOrganizationIdsByGookAndGroup(
  gook?: string,
  group?: string,
  soon?: string,
) {
  const seasonId = await getCurrentSeasonId();
  const pattern = getOrganizationNamePattern(gook, group, soon);

  const conditions = [eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)];
  if (pattern) conditions.push(like(organizations.name, `${pattern}%`));

  const result = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(and(...conditions));
  return result.map((r) => r.id);
}

/** 국/그룹/순 조건으로 조직 전체 정보를 조회합니다. */
export async function getOrganizationsByGookAndGroup(gook?: string, group?: string, soon?: string) {
  const seasonId = await getCurrentSeasonId();
  const pattern = getOrganizationNamePattern(gook, group, soon);

  const conditions = [eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)];
  if (pattern) conditions.push(like(organizations.name, `${pattern}%`));

  return db
    .select()
    .from(organizations)
    .where(and(...conditions));
}

/** 하위 조직을 조회합니다. */
export async function getChildOrganizations(parentId: number) {
  return db.select().from(organizations).where(eq(organizations.upperOrganizationId, parentId));
}
