/** 최근 일요일 예배 출석 현황 조회 + 엑셀 변환 */
import { pool } from '../../../db';
import { getCurrentSeasonId } from '../../season/season.service';
import { formatDate, formatDateShort, getRecentSunday } from '../../shared/date.util';
import { attendanceToExcel } from '../utils/excel';

interface SundayAttendanceRow {
  organization_name: string;
  user_name: string;
  [key: string]: string | number | null;
}

/** 최근 일요일 대예배/청년예배 출석 현황을 조회합니다. */
export async function getRecentSundayAttendance(
  date?: Date | string,
): Promise<SundayAttendanceRow[]> {
  const seasonId = await getCurrentSeasonId();
  const recentSunday = getRecentSunday(date);
  const dateStr = formatDate(recentSunday);
  const shortDateStr = formatDateShort(recentSunday);

  const nextDay = new Date(recentSunday);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = formatDate(nextDay);

  const query = `
    SELECT
      o.name AS organization_name,
      u.name AS user_name,
      MAX(CASE WHEN a.name LIKE '%3부%' THEN att.attendance_status END) AS \`${shortDateStr} 대예배\`,
      MAX(CASE WHEN a.name LIKE '%청년%' THEN att.attendance_status END) AS \`${shortDateStr} 청년\`
    FROM user u
    JOIN user_role ur ON ur.user_id = u.id
    JOIN organization o ON o.id = ur.organization_id
    LEFT JOIN attendance att ON att.user_id = u.id
    LEFT JOIN activity a
      ON a.id = att.activity_id
      AND a.start_time >= ?
      AND a.start_time < ?
      AND a.is_deleted = 0
    WHERE u.is_deleted = 0 AND o.season_id = ?
    GROUP BY o.name, u.id, u.name
    ORDER BY o.name, u.id
  `;

  const [rows] = await pool.execute(query, [
    `${dateStr} 00:00:00`,
    `${nextDayStr} 00:00:00`,
    seasonId,
  ]);
  return rows as SundayAttendanceRow[];
}

/** 일요일 출석 현황을 엑셀 버퍼로 변환합니다. */
export async function recentSundayAttendanceToExcel(data: SundayAttendanceRow[]): Promise<Buffer> {
  return attendanceToExcel(data);
}
