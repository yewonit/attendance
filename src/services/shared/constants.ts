/** 프로젝트 전역 상수 정의 */

/** 어드민 사용자 ID 목록 — is_deleted 체크를 건너뛰는 특수 계정. 국장, 그룹장, 순장 테스트용 */
export const ADMIN_USER_IDS = [2520, 2519, 2518] as const;

/** 역할 ID 매핑 */
export const ROLE_IDS = {
  GROUP_LEADER: 1,
  MEMBER: 5,
} as const;

/** 활동 유형 (예배명) */
export const ACTIVITY_TYPES = {
  SUNDAY: '주일3부예배',
  SUNDAY_2: '주일2부예배',
  SUNDAY_YOUNG_ADULT: '청년예배',
  WEDNESDAY_YOUNG_ADULT: '수요청년예배',
  FRIDAY_YOUNG_ADULT: '금요청년예배',
} as const;

/** 연속 출석/결석 기준 주차 */
export const WEEK_THRESHOLDS = {
  FOUR_WEEKS: 4,
  THREE_WEEKS: 3,
  TWO_WEEKS: 2,
} as const;

/** 출석 상태 */
export const ATTENDANCE_STATUS = {
  PRESENT: '출석',
  ABSENT: '결석',
} as const;

/** 기본 역할명 */
export const DEFAULT_ROLE_NAME = '순원';

/** 새가족 기간 (28일) */
export const NEW_MEMBER_DURATION_DAYS = 28;

/** 장결자 판정 연속 결석 횟수 */
export const LONG_TERM_ABSENCE_THRESHOLD = 4;
