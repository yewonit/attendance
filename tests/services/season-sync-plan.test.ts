import { describe, expect, it } from 'vitest';
import {
  groupUnusedOrgIdsByDepth,
  orgKey,
  planUserRoleChanges,
  tupleKey,
} from '../../src/services/season/modules/sync-plan';

describe('planUserRoleChanges', () => {
  const t = (userId: number, roleId: number, organizationId: number) => ({
    userId,
    roleId,
    organizationId,
  });

  it('같은 엑셀을 다시 올리면 모든 행을 그대로 유지한다', () => {
    const plan = planUserRoleChanges(
      [t(10, 5, 100), t(11, 6, 100)],
      [t(11, 6, 100), t(10, 5, 100)],
    );
    expect(plan).toEqual({
      keep: [t(11, 6, 100), t(10, 5, 100)],
      updates: [],
      deletes: [],
      inserts: [],
    });
  });

  it('소속이나 직분만 바뀐 사용자는 기존 행을 수정해 재사용한다', () => {
    const plan = planUserRoleChanges([t(10, 5, 100)], [t(10, 3, 200)]);
    expect(plan.updates).toEqual([{ from: t(10, 5, 100), to: t(10, 3, 200) }]);
    expect(plan.inserts).toEqual([]);
    expect(plan.deletes).toEqual([]);
  });

  it('새 사용자는 추가하고 빠진 사용자는 삭제한다 (다른 사용자의 행을 재활용하지 않는다)', () => {
    const plan = planUserRoleChanges([t(10, 5, 100)], [t(20, 5, 100)]);
    expect(plan.inserts).toEqual([t(20, 5, 100)]);
    expect(plan.deletes).toEqual([{ tuple: t(10, 5, 100), count: 1, deleteAllCopies: true }]);
    expect(plan.updates).toEqual([]);
  });

  it('완전히 일치하는 행을 우선 유지한 뒤 같은 사용자의 남은 행을 재사용한다', () => {
    // 사용자 10이 두 조직에 있었고, 이번에는 100은 그대로 + 200 → 300으로 이동
    const plan = planUserRoleChanges(
      [t(10, 5, 200), t(10, 5, 100)],
      [t(10, 5, 300), t(10, 5, 100)],
    );
    expect(plan.keep).toEqual([t(10, 5, 100)]);
    expect(plan.updates).toEqual([{ from: t(10, 5, 200), to: t(10, 5, 300) }]);
    expect(plan.inserts).toEqual([]);
    expect(plan.deletes).toEqual([]);
  });

  it('중복된 조합은 유지할 수만큼 남기고 나머지만 개수 지정으로 삭제한다', () => {
    const plan = planUserRoleChanges(
      [t(10, 5, 100), t(10, 5, 100), t(10, 5, 100)],
      [t(10, 5, 100)],
    );
    expect(plan.keep).toEqual([t(10, 5, 100)]);
    expect(plan.updates).toEqual([]);
    expect(plan.deletes).toEqual([{ tuple: t(10, 5, 100), count: 2, deleteAllCopies: false }]);
  });

  it('수정 대상과 목표, 추가 대상은 서로 겹치지 않는다', () => {
    const existing = [t(1, 5, 100), t(1, 5, 100), t(2, 5, 100), t(3, 4, 200)];
    const desired = [t(1, 5, 100), t(2, 3, 100), t(3, 5, 100), t(4, 5, 100), t(1, 5, 300)];
    const plan = planUserRoleChanges(existing, desired);
    const fromKeys = new Set(plan.updates.map((u) => tupleKey(u.from)));
    for (const target of [...plan.updates.map((u) => u.to), ...plan.inserts]) {
      expect(fromKeys.has(tupleKey(target))).toBe(false);
    }
    // 실행 결과(유지 + 수정 목표 + 추가)가 목표 다중집합과 같다
    const result = [...plan.keep, ...plan.updates.map((u) => u.to), ...plan.inserts]
      .map(tupleKey)
      .sort();
    expect(result).toEqual(desired.map(tupleKey).sort());
    // 기존 행은 유지/수정/삭제 중 정확히 한 번씩 소비된다
    const consumed =
      plan.keep.length + plan.updates.length + plan.deletes.reduce((n, d) => n + d.count, 0);
    expect(consumed).toBe(existing.length);
  });

  it('기존 행이 없으면 전부 추가한다', () => {
    expect(planUserRoleChanges([], [t(1, 1, 1)])).toEqual({
      keep: [],
      updates: [],
      deletes: [],
      inserts: [t(1, 1, 1)],
    });
  });
});

describe('groupUnusedOrgIdsByDepth', () => {
  // 루트(1, 상위는 시즌 밖 id 0) → 국(2) → 그룹(3) → 순(4), 순(5)
  const orgs = [
    { id: 1, name: '루트', upperOrganizationId: 0 },
    { id: 2, name: '1국', upperOrganizationId: 1 },
    { id: 3, name: '1국_김그룹', upperOrganizationId: 2 },
    { id: 4, name: '1국_김그룹_이순', upperOrganizationId: 3 },
    { id: 5, name: '1국_김그룹_박순', upperOrganizationId: 3 },
  ];

  it('미사용 조직을 하위 단계부터 묶어 반환한다', () => {
    expect(groupUnusedOrgIdsByDepth(orgs, new Set([1]))).toEqual([[4, 5], [3], [2]]);
  });

  it('사용 중인 조직은 제외한다', () => {
    expect(groupUnusedOrgIdsByDepth(orgs, new Set([1, 2, 3, 4]))).toEqual([[5]]);
  });

  it('모두 사용 중이면 빈 배열을 반환한다', () => {
    expect(groupUnusedOrgIdsByDepth(orgs, new Set([1, 2, 3, 4, 5]))).toEqual([]);
  });

  it('순환 참조가 있어도 멈추지 않는다', () => {
    const cyclic = [
      { id: 1, name: 'a', upperOrganizationId: 2 },
      { id: 2, name: 'b', upperOrganizationId: 1 },
    ];
    expect(groupUnusedOrgIdsByDepth(cyclic, new Set()).flat().sort()).toEqual([1, 2]);
  });
});

describe('orgKey', () => {
  it('상위 조직이 없으면 null로 구분한다', () => {
    expect(orgKey(null, '루트')).toBe('null|루트');
    expect(orgKey(3, '1국_김그룹')).toBe('3|1국_김그룹');
  });
});
