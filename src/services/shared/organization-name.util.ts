/** 조직명 파싱/빌드 유틸리티 — 조직명 컨벤션: "N국_OOO그룹_OOO순" */

export interface ParsedOrganization {
  department: string | null;
  group: string | null;
  team: string | null;
}

/** 조직명을 소속국/소속그룹/소속순으로 파싱합니다. */
export function parseOrganizationName(orgName: string | null): ParsedOrganization {
  if (!orgName) return { department: null, group: null, team: null };
  const parts = orgName.split('_');
  return {
    department: parts[0] ?? null,
    group: parts[1] ?? null,
    team: parts[2] ?? null,
  };
}

/**
 * 국/그룹/순 정보로 조직명 패턴을 생성합니다.
 * @example getOrganizationNamePattern("1", "김민수", "이용걸") → "1국_김민수그룹_이용걸순"
 */
export function getOrganizationNamePattern(gook?: string, group?: string, soon?: string): string {
  if (!gook) return '';
  if (!group) return `${gook}국`;
  if (!soon) return `${gook}국_${group}그룹`;
  return `${gook}국_${group}그룹_${soon}순`;
}

/**
 * 필터 조건으로 LIKE 패턴을 생성합니다.
 * @example buildOrganizationNamePattern("1국", "김민수그룹") → "1국_김민수그룹"
 */
export function buildOrganizationNamePattern(
  department?: string,
  group?: string,
  team?: string,
): string | null {
  if (!department && !group && !team) return null;

  let pattern = '';
  if (department) pattern = department;
  if (group) pattern = pattern ? `${pattern}_${group}` : `%_${group}`;
  if (team) pattern = pattern ? `${pattern}_${team}` : `%_%_${team}`;
  return pattern;
}
