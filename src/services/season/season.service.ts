/** 시즌(회기) 서비스 — 현재 시즌 조회, 다음 시즌 조직 조회 등 */
import { and, asc, eq, gte, inArray, like, lte, sql } from 'drizzle-orm';
import { db } from '../../db';
import { organizations } from '../../db/schema/organization';
import { roles } from '../../db/schema/role';
import { seasons } from '../../db/schema/season';
import { users } from '../../db/schema/user';
import { userRoles } from '../../db/schema/user-role';
import { BadRequestError, NotFoundError } from '../../utils/errors';
import { getKstYear } from '../shared/date.util';
import { parseOrganizationName } from '../shared/organization-name.util';

/** 현재 날짜 기준 활성 시즌 ID를 반환합니다. */
export async function getCurrentSeasonId(): Promise<number> {
  const now = new Date();
  const result = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(
      and(eq(seasons.isDeleted, false), lte(seasons.startDate, now), gte(seasons.endDate, now)),
    )
    .limit(1);

  if (result.length === 0) {
    throw new NotFoundError('Season');
  }
  return result[0].id;
}

/**
 * 다음 회기에서 사용자의 조직 정보를 조회합니다.
 * 동명이인이 있을 경우 모든 사용자의 정보를 배열로 반환합니다.
 */
export async function getNextOrganization(
  name?: string,
  userId?: number,
): Promise<NextOrgResult[]> {
  const currentSeasonId = await getCurrentSeasonId();
  const nextSeasonId = currentSeasonId + 1;

  const season = await db
    .select({ id: seasons.id })
    .from(seasons)
    .where(eq(seasons.id, nextSeasonId))
    .limit(1);

  if (season.length === 0) {
    throw new NotFoundError('Season', nextSeasonId);
  }

  const userConditions = userId ? eq(users.id, userId) : name ? eq(users.name, name) : undefined;
  if (!userConditions) {
    throw new NotFoundError('User');
  }

  const rows = await db
    .select({
      userId: users.id,
      userName: users.name,
      userPhone: users.phoneNumber,
      userBirthDate: users.birthDate,
      roleId: roles.id,
      roleName: roles.name,
      roleSortOrder: roles.sortOrder,
      orgId: organizations.id,
      orgName: organizations.name,
      orgUpperId: organizations.upperOrganizationId,
    })
    .from(userRoles)
    .innerJoin(users, eq(userRoles.userId, users.id))
    .innerJoin(organizations, eq(userRoles.organizationId, organizations.id))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      and(
        userConditions,
        eq(organizations.seasonId, nextSeasonId),
        eq(organizations.isDeleted, false),
      ),
    );

  if (rows.length === 0) {
    const criteria = userId ? `userId: ${userId}` : `이름: ${name}`;
    throw new NotFoundError(`다음 회기에 ${criteria} 사용자`);
  }

  const usersMap = new Map<number, (typeof rows)[number][]>();
  for (const row of rows) {
    const list = usersMap.get(row.userId) ?? [];
    list.push(row);
    usersMap.set(row.userId, list);
  }

  const results: NextOrgResult[] = [];

  for (const [, userRows] of usersMap) {
    const primary = userRows[0];
    const upperOrgId = primary.orgUpperId;

    // 그룹장 조회
    const groupLeaderRows = upperOrgId
      ? await db
          .select({
            name: users.name,
            phoneNumber: users.phoneNumber,
            birthDate: users.birthDate,
            roleName: roles.name,
          })
          .from(userRoles)
          .innerJoin(users, eq(userRoles.userId, users.id))
          .innerJoin(organizations, eq(userRoles.organizationId, organizations.id))
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(and(eq(organizations.upperOrganizationId, upperOrgId), eq(roles.id, 1)))
          .limit(1)
      : [];

    // 같은 조직 멤버 조회
    const sameOrgRows = await db
      .select({
        name: users.name,
        phoneNumber: users.phoneNumber,
        birthDate: users.birthDate,
        roleName: roles.name,
        sortOrder: roles.sortOrder,
      })
      .from(userRoles)
      .innerJoin(users, eq(userRoles.userId, users.id))
      .innerJoin(organizations, eq(userRoles.organizationId, organizations.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(organizations.id, primary.orgId));

    sameOrgRows.sort(
      (a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name),
    );

    const toBirthYear = (bd: Date | string | null) =>
      bd ? new Date(bd).getFullYear().toString().slice(-2) : null;

    const groupLeader = groupLeaderRows[0] ?? null;
    const sameOrgPeople = sameOrgRows.map((m) => ({
      name: m.name,
      role: m.roleName,
      phoneNumber: m.phoneNumber,
      birthYear: toBirthYear(m.birthDate),
    }));

    const isLeaderInOrg =
      groupLeader &&
      sameOrgPeople.some(
        (p) => p.name === groupLeader.name && p.phoneNumber === groupLeader.phoneNumber,
      );

    const orgPeople = [
      ...(groupLeader && !isLeaderInOrg
        ? [
            {
              name: groupLeader.name,
              role: groupLeader.roleName,
              phoneNumber: groupLeader.phoneNumber,
              birthYear: toBirthYear(groupLeader.birthDate),
            },
          ]
        : []),
      ...sameOrgPeople,
    ];

    results.push({
      name: primary.userName,
      birthYear: toBirthYear(primary.userBirthDate),
      phoneNumber: primary.userPhone,
      role: primary.roleName,
      organization: primary.orgName,
      organizationPeople: orgPeople,
    });
  }

  return results;
}

/**
 * 현재 회기 구성원을 소속(국/그룹/순)과 함께 조회합니다.
 * 회기 변경 엑셀의 행을 기존 인원과 재매칭할 때 사용합니다. 직분이 여러 개인 사용자는 여러 행으로 반환됩니다.
 */
export async function getCurrentSeasonMembers(): Promise<CurrentSeasonMember[]> {
  const seasonId = await getCurrentSeasonId();
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      nameSuffix: users.nameSuffix,
      phoneNumber: users.phoneNumber,
      birthDate: users.birthDate,
      orgName: organizations.name,
      roleName: roles.name,
    })
    .from(userRoles)
    .innerJoin(users, and(eq(userRoles.userId, users.id), eq(users.isDeleted, false)))
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .orderBy(organizations.name, users.name);

  return rows.map((r) => {
    const org = parseOrganizationName(r.orgName);
    return {
      userId: r.userId,
      name: r.name,
      nameSuffix: r.nameSuffix,
      phoneNumber: r.phoneNumber,
      birthYear: r.birthDate ? String(getKstYear(new Date(r.birthDate))).slice(-2) : null,
      gook: org.department,
      group: org.group,
      soon: org.team,
      role: r.roleName,
    };
  });
}

/** 재매칭 후보 최대 인원 (동명이인은 보통 몇 명 수준) */
const REMATCH_CANDIDATE_LIMIT = 50;

/**
 * 회기 변경 재매칭 후보: 이름이 같은(공백 무시) 사용자와 각자의 현재 회기 소속(국/그룹/순)을 조회합니다.
 * 현재 회기에 소속이 없는 사용자(새가족 등)도 organizations가 빈 배열로 포함됩니다.
 */
export async function getRematchCandidates(name: string): Promise<RematchCandidate[]> {
  const normalized = name.replace(/\s+/g, '');
  if (!normalized) throw new BadRequestError('이름이 필요합니다.');

  const people = await db
    .select({
      id: users.id,
      name: users.name,
      nameSuffix: users.nameSuffix,
      phoneNumber: users.phoneNumber,
      birthDate: users.birthDate,
    })
    .from(users)
    .where(and(eq(users.isDeleted, false), sql`REPLACE(${users.name}, ' ', '') = ${normalized}`))
    .orderBy(asc(users.id))
    .limit(REMATCH_CANDIDATE_LIMIT);
  if (people.length === 0) return [];

  const seasonId = await getCurrentSeasonId();
  const roleRows = await db
    .select({
      userId: userRoles.userId,
      orgName: organizations.name,
      roleName: roles.name,
      roleSortOrder: roles.sortOrder,
    })
    .from(userRoles)
    .innerJoin(
      organizations,
      and(
        eq(userRoles.organizationId, organizations.id),
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
      ),
    )
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(
      inArray(
        userRoles.userId,
        people.map((p) => p.id),
      ),
    );

  return people.map((p) => ({
    userId: p.id,
    name: p.name,
    nameSuffix: p.nameSuffix,
    phoneNumber: p.phoneNumber,
    birthYear: p.birthDate ? String(getKstYear(new Date(p.birthDate))).slice(-2) : null,
    organizations: roleRows
      .filter((r) => r.userId === p.id)
      .sort((a, b) => a.roleSortOrder - b.roleSortOrder)
      .map((r) => {
        const org = parseOrganizationName(r.orgName);
        return { gook: org.department, group: org.group, soon: org.team, role: r.roleName };
      }),
  }));
}

/** 237국/올네이션스국 조직 목록을 조회합니다. */
export async function getAllNationsOrgList() {
  const seasonId = await getCurrentSeasonId();
  return db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(
      and(
        eq(organizations.seasonId, seasonId),
        eq(organizations.isDeleted, false),
        like(organizations.name, '%순'),
      ),
    );
}

export interface NextOrgPerson {
  name: string;
  role: string;
  phoneNumber: string;
  birthYear: string | null;
}

export interface NextOrgResult {
  name: string;
  birthYear: string | null;
  phoneNumber: string;
  role: string;
  organization: string;
  organizationPeople: NextOrgPerson[];
}

export interface CurrentSeasonMember {
  userId: number;
  name: string;
  nameSuffix: string | null;
  phoneNumber: string;
  /** 기수 (KST 기준 연도 두 자리) */
  birthYear: string | null;
  gook: string | null;
  group: string | null;
  soon: string | null;
  role: string;
}

export interface RematchCandidate {
  userId: number;
  name: string;
  nameSuffix: string | null;
  phoneNumber: string;
  /** 기수 (KST 기준 연도 두 자리) */
  birthYear: string | null;
  /** 현재 회기 소속 (직분 우선순위 순, 소속이 없으면 빈 배열) */
  organizations: { gook: string | null; group: string | null; soon: string | null; role: string }[];
}
