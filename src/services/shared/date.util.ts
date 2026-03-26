/** 날짜 관련 공통 유틸리티 */

/** 특정 날짜 기준 가장 최근 일요일을 반환합니다. */
export function getRecentSunday(date?: Date | string): Date {
  const base = date ? new Date(date) : new Date();
  const day = base.getDay();
  const diff = day === 0 ? 0 : day;
  const recent = new Date(base);
  recent.setDate(base.getDate() - diff);
  recent.setHours(0, 0, 0, 0);
  return recent;
}

/** 특정 날짜 기준 가장 최근 수요일을 반환합니다. */
export function getRecentWednesday(date?: Date | string): Date {
  const base = date ? new Date(date) : new Date();
  const day = base.getDay();
  const diff = day === 3 ? 0 : (day - 3 + 7) % 7;
  const recent = new Date(base);
  recent.setDate(base.getDate() - diff);
  recent.setHours(0, 0, 0, 0);
  return recent;
}

/** YYYY-MM-DD 형식으로 포맷합니다. */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** MM-DD 형식으로 포맷합니다. */
export function formatDateShort(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}-${d}`;
}

/** N일 전 Date를 반환합니다. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** 주어진 년도 12월 첫 일요일을 반환합니다. */
export function getFirstSundayOfDecember(year: number): Date {
  const dec1 = new Date(year, 11, 1);
  const dayOfWeek = dec1.getDay();
  const offset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return new Date(year, 11, 1 + offset);
}

/**
 * 주어진 년도 11월 마지막 일요일 이후 첫 수요일 21:20:00을 반환합니다.
 * 시즌 종료일 계산에 사용됩니다.
 */
export function getFirstWednesdayAfterLastSundayOfNovember(year: number): Date {
  const lastDayOfNov = new Date(year, 10, 30);
  const lastSunday = new Date(lastDayOfNov);
  while (lastSunday.getDay() !== 0) {
    lastSunday.setDate(lastSunday.getDate() - 1);
  }

  const firstWed = new Date(lastSunday);
  const daysUntilWed = (3 - lastSunday.getDay() + 7) % 7;
  firstWed.setDate(lastSunday.getDate() + (daysUntilWed === 0 ? 7 : daysUntilWed));
  firstWed.setHours(21, 20, 0, 0);
  return firstWed;
}
