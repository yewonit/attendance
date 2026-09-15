import { describe, expect, it } from 'vitest';
import { buildOrganizationNamePattern } from '../../src/services/shared/organization-name.util';
import { pickHighestRole } from '../../src/services/shared/role.util';
import { escapeLike } from '../../src/services/shared/sql.util';

describe('escapeLike', () => {
  it('LIKE 와일드카드 문자(\\, %, _)를 이스케이프한다', () => {
    expect(escapeLike('a%b_c\\d')).toBe('a\\%b\\_c\\\\d');
  });
});

describe('buildOrganizationNamePattern', () => {
  it('조건이 없으면 null을 반환한다', () => {
    expect(buildOrganizationNamePattern()).toBeNull();
  });

  it('국/그룹/순을 이스케이프된 구분자로 연결한다', () => {
    expect(buildOrganizationNamePattern('1국')).toBe('1국');
    expect(buildOrganizationNamePattern('1국', '김민수그룹')).toBe('1국\\_김민수그룹');
    expect(buildOrganizationNamePattern('1국', '김민수그룹', '이용걸순')).toBe('1국\\_김민수그룹\\_이용걸순');
  });

  it('지정하지 않은 중간 단계는 %로 채운다', () => {
    expect(buildOrganizationNamePattern(undefined, '김민수그룹')).toBe('%\\_김민수그룹');
    expect(buildOrganizationNamePattern('1국', undefined, '이용걸순')).toBe('1국\\_%\\_이용걸순');
  });
});

describe('pickHighestRole', () => {
  it('level이 가장 낮은 역할을 고르고, level이 없으면 가장 낮은 우선순위로 취급한다', () => {
    const rows = [
      { roleName: '순원', roleLevel: 5 },
      { roleName: '미정', roleLevel: null },
      { roleName: '순장', roleLevel: 3 },
    ];
    expect(pickHighestRole(rows)?.roleName).toBe('순장');
  });

  it('빈 배열이면 undefined를 반환한다', () => {
    expect(pickHighestRole([])).toBeUndefined();
  });
});
