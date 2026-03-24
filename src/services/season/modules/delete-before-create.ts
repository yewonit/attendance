/** 새 회기 조직 생성 전 기존 조직/역할 데이터를 정리합니다. */
import { and, eq, inArray } from 'drizzle-orm';
import type { db } from '../../../db';
import { organizations } from '../../../db/schema/organization';
import { userRoles } from '../../../db/schema/user-role';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** 해당 시즌의 기존 조직과 연관 UserRole을 삭제합니다. */
export async function deleteBeforeCreateOrganization(seasonId: number, tx: Tx): Promise<void> {
  const existingOrgs = await tx
    .select({ id: organizations.id })
    .from(organizations)
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)));

  const orgIds = existingOrgs.map((o) => o.id);
  if (orgIds.length === 0) return;

  await tx.delete(userRoles).where(inArray(userRoles.organizationId, orgIds));
  await tx
    .delete(organizations)
    .where(and(eq(organizations.seasonId, seasonId), eq(organizations.isDeleted, false)));
}
