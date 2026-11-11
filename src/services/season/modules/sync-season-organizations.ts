/**
 * 새 회기 조직/직분 동기화
 * 계층 구조(루트 → 국 → 그룹 → 순)와 사용자 직분을 엑셀 데이터에 맞춥니다.
 * 기존에는 업로드마다 회기 조직을 전부 지우고 다시 만들어 id가 계속 증가했으므로,
 * 이미 있는 조직·직분 행은 재사용하고 바뀐 부분만 추가/수정/삭제합니다.
 */
import { and, eq, inArray, notInArray, or } from 'drizzle-orm';
import type { db } from '../../../db';
import { organizations } from '../../../db/schema/organization';
import { roles } from '../../../db/schema/role';
import { users } from '../../../db/schema/user';
import { userAttendanceAggregates } from '../../../db/schema/user-attendance-aggregate';
import { userRoles } from '../../../db/schema/user-role';
import { BadRequestError } from '../../../utils/errors';
import { getKstYear } from '../../shared/date.util';
import {
  type UserRoleTuple,
  groupUnusedOrgIdsByDepth,
  orgKey,
  planUserRoleChanges,
} from './sync-plan';
import type { SeasonDataItem } from './validate';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const ROOT_ORG_NAME = '코람데오 청년선교회';
const ROOT_UPPER_ORG_ID = 1;
const INSERT_CHUNK_SIZE = 500;
const DELETE_CHUNK_SIZE = 100;

export interface SeasonSyncResult {
  organizations: { reused: number; created: number; deleted: number };
  userRoles: { kept: number; updated: number; created: number; deleted: number };
}

/** 시즌 데이터를 기준으로 조직 계층과 사용자 직분을 동기화합니다. */
export async function syncSeasonOrganizations(
  data: SeasonDataItem[],
  seasonId: number,
  tx: Tx,
): Promise<SeasonSyncResult> {
  const existingOrgs = await tx
    .select({
      id: organizations.id,
      name: organizations.name,
      upperOrganizationId: organizations.upperOrganizationId,
    })
    .from(organizations)
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)));

  // 같은 (상위 조직, 이름)이 중복돼 있으면 먼저 만들어진 것을 사용하고 나머지는 미사용으로 정리됩니다.
  const orgIdByKey = new Map<string, number>();
  for (const org of [...existingOrgs].sort((a, b) => a.id - b.id)) {
    const key = orgKey(org.upperOrganizationId, org.name);
    if (!orgIdByKey.has(key)) orgIdByKey.set(key, org.id);
  }

  const usedOrgIds = new Set<number>();
  let createdOrgCount = 0;

  const ensureOrg = async (name: string, upperOrganizationId: number): Promise<number> => {
    const key = orgKey(upperOrganizationId, name);
    let id = orgIdByKey.get(key);
    if (id === undefined) {
      const [result] = await tx
        .insert(organizations)
        .values({ seasonId, name, upperOrganizationId, isDeleted: false });
      id = result.insertId;
      orgIdByKey.set(key, id);
      createdOrgCount++;
    }
    usedOrgIds.add(id);
    return id;
  };

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

  const rootOrgId = await ensureOrg(ROOT_ORG_NAME, ROOT_UPPER_ORG_ID);
  const desired: UserRoleTuple[] = [];

  for (const item of data) {
    const { gook, group, soon } = item;
    const gookOrgId = await ensureOrg(gook, rootOrgId);
    const groupOrgId = await ensureOrg(`${gook}_${group}`, gookOrgId);
    const soonOrgId = await ensureOrg(`${gook}_${group}_${soon}`, groupOrgId);

    const user = resolveUser(item, allUsers);
    const role = allRoles.find((r) => r.name === item.role);
    if (!role) throw new BadRequestError(`${item.role} 역할을 찾을 수 없습니다.`);

    desired.push({ userId: user.id, roleId: role.id, organizationId: soonOrgId });
  }

  // --- 직분(user_role) 동기화: id 대신 (사용자, 직분, 조직) 조합으로 식별 ---
  const existingOrgIds = existingOrgs.map((o) => o.id);
  const existingUserRoles =
    existingOrgIds.length === 0
      ? []
      : await tx
          .select({
            userId: userRoles.userId,
            roleId: userRoles.roleId,
            organizationId: userRoles.organizationId,
          })
          .from(userRoles)
          .where(inArray(userRoles.organizationId, existingOrgIds));

  const plan = planUserRoleChanges(existingUserRoles, desired);

  // 1) 같은 사용자의 기존 행을 제자리에서 수정 (행 1개씩)
  for (const { from, to } of plan.updates) {
    await tx
      .update(userRoles)
      .set({ roleId: to.roleId, organizationId: to.organizationId })
      .where(matchesTuple(from))
      .limit(1);
  }
  // 2) 빠진 행 삭제: 조합째 지워도 되는 것은 묶어서, 일부만 지워야 하는 중복 조합은 개수만큼
  const deleteAll = plan.deletes.filter((d) => d.deleteAllCopies).map((d) => d.tuple);
  for (let i = 0; i < deleteAll.length; i += DELETE_CHUNK_SIZE) {
    const chunk = deleteAll.slice(i, i + DELETE_CHUNK_SIZE);
    await tx.delete(userRoles).where(or(...chunk.map(matchesTuple)));
  }
  for (const d of plan.deletes.filter((del) => !del.deleteAllCopies)) {
    await tx.delete(userRoles).where(matchesTuple(d.tuple)).limit(d.count);
  }
  // 3) 새 행 추가
  for (let i = 0; i < plan.inserts.length; i += INSERT_CHUNK_SIZE) {
    await tx.insert(userRoles).values(plan.inserts.slice(i, i + INSERT_CHUNK_SIZE));
  }

  // --- 쓰이지 않는 조직 삭제 (직분 정리 후, 하위 조직부터) ---
  const unusedLevels = groupUnusedOrgIdsByDepth(existingOrgs, usedOrgIds);
  for (const ids of unusedLevels) {
    await tx.delete(organizations).where(inArray(organizations.id, ids));
  }

  const assignedUserIds = [...new Set(desired.map((d) => d.userId))];
  if (assignedUserIds.length > 0) {
    await tx
      .update(userAttendanceAggregates)
      .set({ isDisabled: true })
      .where(notInArray(userAttendanceAggregates.userId, assignedUserIds));
  }

  const deletedOrgCount = unusedLevels.reduce((sum, ids) => sum + ids.length, 0);
  return {
    organizations: {
      reused: usedOrgIds.size - createdOrgCount,
      created: createdOrgCount,
      deleted: deletedOrgCount,
    },
    userRoles: {
      kept: plan.keep.length,
      updated: plan.updates.length,
      created: plan.inserts.length,
      deleted: plan.deletes.reduce((sum, d) => sum + d.count, 0),
    },
  };
}

function matchesTuple(t: UserRoleTuple) {
  return and(
    eq(userRoles.userId, t.userId),
    eq(userRoles.roleId, t.roleId),
    eq(userRoles.organizationId, t.organizationId),
  );
}

type UserRow = {
  id: number;
  name: string;
  nameSuffix: string | null;
  phoneNumber: string;
  birthDate: Date | null;
};

/**
 * 엑셀 행에 해당하는 사용자를 찾습니다.
 * 프론트에서 매칭/재매칭으로 확정한 userId가 있으면 그대로 사용하고,
 * 없으면 이름 → 전화번호 → 기수 → 구분 순서로 한 명을 특정합니다.
 */
function resolveUser(item: SeasonDataItem, allUsers: UserRow[]): UserRow {
  if (item.userId !== undefined) {
    const byId = allUsers.find((u) => u.id === item.userId);
    if (!byId) {
      throw new BadRequestError(
        `${item.name}: 매칭된 사용자(id ${item.userId})를 찾을 수 없습니다. 삭제된 사용자인지 확인 후 다시 동기화해주세요.`,
      );
    }
    return byId;
  }

  const candidates = allUsers.filter((u) => u.name === item.name);

  if (candidates.length === 0) {
    throw new BadRequestError(
      `${item.name} (전화번호: ${item.phoneNumber}) 사용자를 찾을 수 없습니다.`,
    );
  }
  if (candidates.length === 1) return candidates[0];

  if (item.phoneNumber) {
    const byPhone = candidates.filter((u) => u.phoneNumber === item.phoneNumber);
    if (byPhone.length === 1) return byPhone[0];
    if (byPhone.length > 1)
      throw new BadRequestError(
        `${item.name} (전화번호: ${item.phoneNumber}) 한 명으로 특정이 불가능합니다.`,
      );
  }
  if (item.birthDate) {
    // 엑셀의 기수는 연도만 의미하므로(validate에서 YYYY-01-01로 변환) 연도끼리 비교합니다.
    const targetYear = Number(item.birthDate.slice(0, 4));
    const byBirth = candidates.filter(
      (u) => u.birthDate !== null && getKstYear(new Date(u.birthDate)) === targetYear,
    );
    if (byBirth.length === 1) return byBirth[0];
    if (byBirth.length > 1)
      throw new BadRequestError(
        `${item.name} (기수: ${item.birthDate.slice(2, 4)}) 한 명으로 특정이 불가능합니다.`,
      );
  }
  if (item.nameSuffix) {
    const bySuffix = candidates.filter((u) => u.nameSuffix === item.nameSuffix);
    if (bySuffix.length === 1) return bySuffix[0];
    if (bySuffix.length > 1)
      throw new BadRequestError(
        `${item.name} (접미사: ${item.nameSuffix}) 한 명으로 특정이 불가능합니다.`,
      );
  }
  throw new BadRequestError(`${item.name} ${item.phoneNumber} 한 명으로 특정이 불가능합니다.`);
}
