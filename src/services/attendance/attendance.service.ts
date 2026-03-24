/**
 * 출석 서비스 — 개별 모듈들을 통합 re-export합니다.
 * 라우트에서는 이 파일만 import하여 모든 출석 관련 기능에 접근합니다.
 */
export { getRecentSundayAttendance, recentSundayAttendanceToExcel } from './modules/recent-sunday';
export {
  getRecentWednesdayAttendance,
  recentWednesdayAttendanceToExcel,
} from './modules/recent-wednesday';
export { getWeeklyAttendanceAggregation } from './modules/weekly-aggregation';
export { getWeeklyAttendanceGraph } from './modules/weekly-graph';
export { getContinuousMembers } from './modules/continuous-members';
export { getYoungAdultAttendanceTrend } from './modules/young-adult-trend';
