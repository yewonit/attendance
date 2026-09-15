/** SQL 작성 유틸리티 */

/** LIKE 패턴에서 와일드카드로 해석되는 문자(\, %, _)를 이스케이프합니다. */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}
