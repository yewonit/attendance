/**
 * 회기 조직/직분 동기화 계획 (순수 함수)
 * 엑셀을 다시 올릴 때마다 조직·직분을 전부 지우고 새로 만들면 auto increment id가 계속 커지므로,
 * 기존 행과 목표 데이터를 비교해 "그대로 둘 것 / 수정할 것 / 새로 만들 것 / 지울 것"을 계산합니다.
 * DB I/O 없이 동작하므로 단위 테스트로 검증합니다.
 *
 * user_role은 환경에 따라 id가 PK가 아닐 수 있어(dev DB는 PK 없이 id가 NULL인 행이 존재)
 * id 대신 (userId, roleId, organizationId) 조합으로 행을 식별합니다.
 */

export interface ExistingOrg {
  id: number;
  name: string;
  upperOrganizationId: number | null;
}

export interface UserRoleTuple {
  userId: number;
  roleId: number;
  organizationId: number;
}

export interface UserRolePlan {
  /** 변경 없이 유지되는 행 */
  keep: UserRoleTuple[];
  /** 같은 사용자의 기존 행을 재사용해 직분/조직만 바꾸는 경우 (기존 행 1개씩 수정) */
  updates: { from: UserRoleTuple; to: UserRoleTuple }[];
  /** 엑셀에서 빠져 삭제할 행 (같은 조합이 여러 번 나오면 그 수만큼) */
  deletes: { tuple: UserRoleTuple; count: number; deleteAllCopies: boolean }[];
  /** 기존 행이 없어 새로 만들어야 하는 행 */
  inserts: UserRoleTuple[];
}

/** 같은 상위 조직 아래에서 이름으로 조직을 식별하는 키 */
export function orgKey(upperOrganizationId: number | null, name: string): string {
  return `${upperOrganizationId ?? 'null'}|${name}`;
}

export function tupleKey(t: UserRoleTuple): string {
  return `${t.userId}|${t.roleId}|${t.organizationId}`;
}

/**
 * 기존 user_role과 목표 배치를 다중집합으로 비교합니다.
 * 1) 사용자·직분·조직이 모두 같은 행은 그대로 둡니다.
 * 2) 남은 목표는 같은 사용자의 남은 기존 행을 재사용해 직분·조직만 바꿉니다.
 * 3) 그래도 남은 목표만 새로 만들고, 쓰이지 않은 기존 행은 지웁니다.
 *
 * 1)에서 같은 조합을 최대한 소진하므로 수정 대상(from)과 목표(to)·추가 대상은 서로 겹치지 않습니다.
 * 따라서 수정 → 삭제 → 추가 순서로 실행하면 조합 기준 WHERE가 다른 행을 건드리지 않습니다.
 */
export function planUserRoleChanges(
  existing: UserRoleTuple[],
  desired: UserRoleTuple[],
): UserRolePlan {
  const existingCount = countByKey(existing);
  const available = new Map(existingCount);
  const keep: UserRoleTuple[] = [];
  const pending: UserRoleTuple[] = [];

  for (const d of desired) {
    const key = tupleKey(d);
    const left = available.get(key) ?? 0;
    if (left > 0) {
      available.set(key, left - 1);
      keep.push(d);
    } else {
      pending.push(d);
    }
  }

  // 남은 기존 행 (사용자별)
  const leftoverByUser = new Map<number, UserRoleTuple[]>();
  for (const e of existing) {
    const key = tupleKey(e);
    const left = available.get(key) ?? 0;
    if (left <= 0) continue;
    available.set(key, left - 1);
    leftoverByUser.set(e.userId, [...(leftoverByUser.get(e.userId) ?? []), e]);
  }

  const updates: UserRolePlan['updates'] = [];
  const inserts: UserRoleTuple[] = [];
  for (const d of pending) {
    const leftovers = leftoverByUser.get(d.userId);
    const from = leftovers?.shift();
    if (from) updates.push({ from, to: d });
    else inserts.push(d);
  }

  const deleteCount = countByKey([...leftoverByUser.values()].flat());
  const keptCount = countByKey(keep);
  const deletes: UserRolePlan['deletes'] = [...deleteCount.entries()].map(([key, count]) => ({
    tuple: parseTupleKey(key),
    count,
    // 유지할 행이 없는 조합이면 (수정이 끝난 뒤) DB에 남은 이 조합의 행은 모두 삭제 대상
    deleteAllCopies: (keptCount.get(key) ?? 0) === 0,
  }));

  return { keep, updates, deletes, inserts };
}

/**
 * 더 이상 쓰이지 않는 조직 id를 깊은 단계(순)부터 얕은 단계(루트) 순서로 묶어 반환합니다.
 * 상위 조직 FK(upper_organization_id)가 걸려 있는 환경을 위해 하위 조직을 먼저 지웁니다.
 */
export function groupUnusedOrgIdsByDepth(orgs: ExistingOrg[], usedIds: Set<number>): number[][] {
  const byId = new Map(orgs.map((o) => [o.id, o]));
  const depthCache = new Map<number, number>();

  const depthOf = (org: ExistingOrg, visiting: Set<number>): number => {
    const cached = depthCache.get(org.id);
    if (cached !== undefined) return cached;
    const parent = org.upperOrganizationId !== null ? byId.get(org.upperOrganizationId) : undefined;
    // 상위가 이 시즌 밖이거나(루트) 순환 참조면 깊이 0으로 취급
    const depth =
      parent && !visiting.has(parent.id) ? depthOf(parent, visiting.add(org.id)) + 1 : 0;
    depthCache.set(org.id, depth);
    return depth;
  };

  const levels = new Map<number, number[]>();
  for (const org of orgs) {
    if (usedIds.has(org.id)) continue;
    const depth = depthOf(org, new Set());
    levels.set(depth, [...(levels.get(depth) ?? []), org.id]);
  }

  return [...levels.entries()].sort(([a], [b]) => b - a).map(([, ids]) => ids);
}

function countByKey(tuples: UserRoleTuple[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of tuples) {
    const key = tupleKey(t);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

function parseTupleKey(key: string): UserRoleTuple {
  const [userId, roleId, organizationId] = key.split('|').map(Number);
  return { userId, roleId, organizationId };
}
