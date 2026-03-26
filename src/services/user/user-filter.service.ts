/**
 * 사용자 필터링/페이지네이션/새가족 조회 서비스
 * 기존 user.js의 getMembersWithFilters, getAllNewMembers를 분리하였습니다.
 */
import { and, eq, like, sql } from 'drizzle-orm';
import { db } from '../../db';
import { organizations } from '../../db/schema/organization';
import { roles } from '../../db/schema/role';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { getCurrentSeasonId } from '../season/season.service';
import {
  buildOrganizationNamePattern,
  parseOrganizationName,
} from '../shared/organization-name.util';

export interface MemberFilters {
  search?: string;
  department?: string;
  group?: string;
  team?: string;
  page?: number;
  limit?: number;
}

/** 구성원 목록을 검색/필터/페이지네이션하여 조회합니다. */
export async function getMembersWithFilters(filters: MemberFilters = {}) {
  const { search, department, group, team, page = 1, limit = 10 } = filters;
  const pageNum = Math.max(1, page);
  const limitNum = Math.min(100, Math.max(1, limit));
  const offset = (pageNum - 1) * limitNum;

  const seasonId = await getCurrentSeasonId();

  const conditions: ReturnType<typeof eq>[] = [eq(users.isDeleted, false)];
  if (search?.trim()) conditions.push(like(users.name, `%${search.trim()}%`));

  const orgConditions: ReturnType<typeof eq>[] = [
    eq(organizations.seasonId, seasonId),
    eq(organizations.isDeleted, false),
  ];
  const orgNamePattern = buildOrganizationNamePattern(department, group, team);
  if (orgNamePattern) orgConditions.push(like(organizations.name, `${orgNamePattern}%`));

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      birthDate: users.birthDate,
      phoneNumber: users.phoneNumber,
      orgName: organizations.name,
      roleName: roles.name,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(organizations, and(eq(userRoles.organizationId, organizations.id), ...orgConditions))
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .where(and(...conditions))
    .orderBy(users.name)
    .limit(limitNum)
    .offset(offset);

  // 전체 건수 조회 (같은 조건)
  const [{ total }] = await db
    .select({ total: sql<number>`count(distinct ${users.id})` })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(organizations, and(eq(userRoles.organizationId, organizations.id), ...orgConditions))
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .where(and(...conditions));

  const totalCount = Number(total);
  const totalPages = Math.ceil(totalCount / limitNum);

  const members = rows.map((r) => {
    const orgInfo = parseOrganizationName(r.orgName);
    const birthYear = r.birthDate ? new Date(r.birthDate).getFullYear().toString().slice(-2) : null;

    return {
      id: r.id,
      name: r.name,
      birthYear,
      phoneNumber: r.phoneNumber,
      affiliation: { department: orgInfo.department, group: orgInfo.group, team: orgInfo.team },
      role: r.roleName,
    };
  });

  return {
    members,
    pagination: { currentPage: pageNum, totalPages, totalCount, limit: limitNum },
  };
}

/** 모든 새가족을 조직 정보와 함께 조회합니다. */
export async function getAllNewMembers() {
  const seasonId = await getCurrentSeasonId();

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      nameSuffix: users.nameSuffix,
      phoneNumber: users.phoneNumber,
      gender: users.gender,
      email: users.email,
      birthDate: users.birthDate,
      isNewMember: users.isNewMember,
      isLongTermAbsentee: users.isLongTermAbsentee,
      registrationDate: users.registrationDate,
      roleId: roles.id,
      roleName: roles.name,
      orgId: organizations.id,
      orgName: organizations.name,
    })
    .from(userRoles)
    .innerJoin(
      users,
      and(eq(userRoles.userId, users.id), eq(users.isNewMember, true), eq(users.isDeleted, false)),
    )
    .leftJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .orderBy(sql`${users.registrationDate} DESC`);

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    nameSuffix: r.nameSuffix || '',
    phoneNumber: r.phoneNumber,
    gender: r.gender,
    email: r.email,
    birthDate: r.birthDate,
    isNewMember: r.isNewMember,
    isLongTermAbsentee: r.isLongTermAbsentee,
    registrationDate: r.registrationDate,
    roleId: r.roleId,
    roleName: r.roleName ?? '순원',
    organizationId: r.orgId,
    organizationName: r.orgName,
  }));
}
