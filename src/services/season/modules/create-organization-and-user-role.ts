/**
 * 새 회기 조직/역할 일괄 생성
 * 계층 구조(루트 → 국 → 그룹 → 순)를 생성하고 사용자에게 역할을 부여합니다.
 */
import { and, eq, notInArray } from 'drizzle-orm';
import type { db } from '../../../db';
import { organizations } from '../../../db/schema/organization';
import { roles } from '../../../db/schema/role';
import { users } from '../../../db/schema/user';
import { userAttendanceAggregates } from '../../../db/schema/user-attendance-aggregate';
import { userRoles } from '../../../db/schema/user-role';
import { BadRequestError } from '../../../utils/errors';
import type { SeasonDataItem } from './validate';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** 시즌 데이터를 기반으로 조직 계층과 사용자 역할을 일괄 생성합니다. */
export async function createOrganizationAndUserRole(
  data: SeasonDataItem[],
  seasonId: number,
  tx: Tx,
): Promise<void> {
  const [rootResult] = await tx.insert(organizations).values({
    seasonId,
    name: '코람데오 청년선교회',
    upperOrganizationId: 1,
    isDeleted: false,
  });
  const rootOrgId = rootResult.insertId;

  const allUsers = await tx
    .select({
      id: users.id,
      name: users.name,
      nameSuffix: users.nameSuffix,
      phoneNumber: users.phoneNumber,
      birthDate: users.birthDate,
    })
    .from(users)
    .where(eq(users.isDeleted, false));

  const allRoles = await tx
    .select({ id: roles.id, name: roles.name })
    .from(roles)
    .where(eq(roles.isDeleted, false));

  const gookOrgs = new Map<string, number>();
  const groupOrgs = new Map<string, number>();
  const soonOrgs = new Map<string, number>();
  const assignedUserIds: number[] = [];

  for (const item of data) {
    const { gook, group, soon } = item;

    if (!gookOrgs.has(gook)) {
      const id = await findOrCreateOrg(tx, gook, rootOrgId, seasonId);
      gookOrgs.set(gook, id);
    }

    const gookOrgId = gookOrgs.get(gook);
    if (gookOrgId === undefined) throw new BadRequestError(`국 조직을 찾을 수 없습니다: ${gook}`);

    const groupKey = `${gook}_${group}`;
    if (!groupOrgs.has(groupKey)) {
      const id = await findOrCreateOrg(tx, groupKey, gookOrgId, seasonId);
      groupOrgs.set(groupKey, id);
    }
    const groupOrgId = groupOrgs.get(groupKey);
    if (groupOrgId === undefined)
      throw new BadRequestError(`그룹 조직을 찾을 수 없습니다: ${groupKey}`);

    const soonKey = `${gook}_${group}_${soon}`;
    if (!soonOrgs.has(soonKey)) {
      const id = await findOrCreateOrg(tx, soonKey, groupOrgId, seasonId);
      soonOrgs.set(soonKey, id);
    }
    const soonOrgId = soonOrgs.get(soonKey);
    if (soonOrgId === undefined)
      throw new BadRequestError(`순 조직을 찾을 수 없습니다: ${soonKey}`);

    const userId = await resolveAndAssignRole(tx, item, soonOrgId, allUsers, allRoles);
    assignedUserIds.push(userId);
  }

  if (assignedUserIds.length > 0) {
    await tx
      .update(userAttendanceAggregates)
      .set({ isDisabled: true })
      .where(notInArray(userAttendanceAggregates.userId, assignedUserIds));
  }
}

async function findOrCreateOrg(
  tx: Tx,
  name: string,
  upperOrgId: number,
  seasonId: number,
): Promise<number> {
  const [existing] = await tx
    .select({ id: organizations.id })
    .from(organizations)
    .where(
      and(
        eq(organizations.seasonId, seasonId),
        eq(organizations.name, name),
        eq(organizations.upperOrganizationId, upperOrgId),
        eq(organizations.isDeleted, false),
      ),
    )
    .limit(1);

  if (existing) return existing.id;

  const [result] = await tx
    .insert(organizations)
    .values({ seasonId, name, upperOrganizationId: upperOrgId, isDeleted: false });
  return result.insertId;
}

type UserRow = {
  id: number;
  name: string;
  nameSuffix: string | null;
  phoneNumber: string;
  birthDate: Date | null;
};
type RoleRow = { id: number; name: string };

async function resolveAndAssignRole(
  tx: Tx,
  item: SeasonDataItem,
  orgId: number,
  allUsers: UserRow[],
  allRoles: RoleRow[],
): Promise<number> {
  const candidates = allUsers.filter((u) => u.name === item.name);

  if (candidates.length === 0) {
    throw new BadRequestError(
      `${item.name} (전화번호: ${item.phoneNumber}) 사용자를 찾을 수 없습니다.`,
    );
  }

  let user: UserRow | null = null;

  if (candidates.length === 1) {
    user = candidates[0];
  } else {
    if (item.phoneNumber) {
      const byPhone = candidates.filter((u) => u.phoneNumber === item.phoneNumber);
      if (byPhone.length === 1) user = byPhone[0];
      else if (byPhone.length > 1)
        throw new BadRequestError(
          `${item.name} (전화번호: ${item.phoneNumber}) 한 명으로 특정이 불가능합니다.`,
        );
    }
    if (!user && item.birthDate) {
      const targetDate = item.birthDate;
      const byBirth = candidates.filter((u) => {
        if (!u.birthDate) return false;
        const bd =
          u.birthDate instanceof Date
            ? u.birthDate.toISOString().slice(0, 10)
            : String(u.birthDate);
        return bd === targetDate;
      });
      if (byBirth.length === 1) user = byBirth[0];
      else if (byBirth.length > 1)
        throw new BadRequestError(
          `${item.name} (생년월일: ${item.birthDate}) 한 명으로 특정이 불가능합니다.`,
        );
    }
    if (!user && item.nameSuffix) {
      const bySuffix = candidates.filter((u) => u.nameSuffix === item.nameSuffix);
      if (bySuffix.length === 1) user = bySuffix[0];
      else if (bySuffix.length > 1)
        throw new BadRequestError(
          `${item.name} (접미사: ${item.nameSuffix}) 한 명으로 특정이 불가능합니다.`,
        );
    }
    if (!user)
      throw new BadRequestError(`${item.name} ${item.phoneNumber} 한 명으로 특정이 불가능합니다.`);
  }

  const role = allRoles.find((r) => r.name === item.role);
  if (!role) throw new BadRequestError(`${item.role} 역할을 찾을 수 없습니다.`);

  await tx.insert(userRoles).values({ userId: user.id, roleId: role.id, organizationId: orgId });
  return user.id;
}
