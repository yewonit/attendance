/** 최근 수요일 수요청년예배 출석 현황 조회 + 엑셀 변환 */
import { pool } from '../../../db';
import { getCurrentSeasonId } from '../../season/season.service';
import { formatDate, formatDateShort, getRecentWednesday } from '../../shared/date.util';
import { attendanceToExcel } from '../utils/excel';

interface WednesdayAttendanceRow {
  organization_name: string;
  user_name: string;
  [key: string]: string | number | null;
}

/** 최근 수요일 수요청년예배 출석 현황을 조회합니다. */
export async function getRecentWednesdayAttendance(
  date?: Date | string,
): Promise<WednesdayAttendanceRow[]> {
  const seasonId = await getCurrentSeasonId();
  const recentWed = getRecentWednesday(date);
  const dateStr = formatDate(recentWed);
  const shortDateStr = formatDateShort(recentWed);

  const nextDay = new Date(recentWed);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = formatDate(nextDay);

  const query = `
    SELECT
      o.name AS organization_name,
      u.name AS user_name,
      MAX(CASE WHEN a.name LIKE '%수요청년%' THEN att.attendance_status END) AS \`${shortDateStr} 수요청년예배\`
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
  return rows as WednesdayAttendanceRow[];
}

/** 수요 출석 현황을 엑셀 버퍼로 변환합니다. */
export async function recentWednesdayAttendanceToExcel(
  data: WednesdayAttendanceRow[],
): Promise<Buffer> {
  return attendanceToExcel(data);
}
