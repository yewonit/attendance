/** 역할(직분) 관련 유틸리티 */

/**
 * 우선순위가 가장 높은(level이 가장 낮은) 역할을 반환합니다.
 * level이 없는 역할은 가장 낮은 우선순위로 취급합니다.
 */
export function pickHighestRole<T extends { roleLevel: number | null }>(rows: T[]): T | undefined {
  return rows.reduce<T | undefined>((best, cur) => {
    if (!best) return cur;
    const curLevel = cur.roleLevel ?? Number.POSITIVE_INFINITY;
    const bestLevel = best.roleLevel ?? Number.POSITIVE_INFINITY;
    return curLevel < bestLevel ? cur : best;
  }, undefined);
}
