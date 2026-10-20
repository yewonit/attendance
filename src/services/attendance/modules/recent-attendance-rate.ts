/** 최근 N개월 예배별 출석률 조회 + 엑셀 변환 */
import { pool } from '../../../db';
import { getCurrentSeasonId } from '../../season/season.service';
import { ACTIVITY_TYPES, ATTENDANCE_STATUS } from '../../shared/constants';
import { formatDate, monthsAgo } from '../../shared/date.util';
import { attendanceToExcel } from '../utils/excel';

interface AttendanceRateRow {
  organization_name: string;
  user_name: string;
  [key: string]: string | number | null;
}

interface CountRow {
  organization_name: string;
  user_id: number;
  user_name: string;
  activity_name: string | null;
  attendance_status: string | null;
  count: number;
}

/** 출석률 집계 대상 예배 — 대예배는 2부/3부를 합산합니다. */
const SERVICES: { label: string; activityNames: string[] }[] = [
  { label: '대예배', activityNames: [ACTIVITY_TYPES.SUNDAY_2, ACTIVITY_TYPES.SUNDAY] },
  { label: '청년예배', activityNames: [ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT] },
  { label: '수요청년예배', activityNames: [ACTIVITY_TYPES.WEDNESDAY_YOUNG_ADULT] },
  { label: '금요청년예배', activityNames: [ACTIVITY_TYPES.FRIDAY_YOUNG_ADULT] },
];

/**
 * 최근 N개월 동안의 예배별 출석/결석 횟수와 출석률을 조회합니다.
 * - 출석률(%) = 출석 / (출석 + 결석) × 100, 기록이 없으면 빈 값
 * - 구성원은 현재 시즌 소속 기준입니다.
 */
export async function getRecentAttendanceRate(months: number): Promise<AttendanceRateRow[]> {
  const seasonId = await getCurrentSeasonId();
  const from = monthsAgo(months);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const query = `
    SELECT
      o.name AS organization_name,
      u.id AS user_id,
      u.name AS user_name,
      a.name AS activity_name,
      att.attendance_status,
      COUNT(DISTINCT att.id) AS count
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
    GROUP BY o.name, u.id, u.name, a.name, att.attendance_status
    ORDER BY o.name, u.id
  `;

  const [rows] = await pool.execute(query, [
    `${formatDate(from)} 00:00:00`,
    `${formatDate(tomorrow)} 00:00:00`,
    seasonId,
  ]);
  return toRateRows(rows as CountRow[]);
}

/** 출석률 현황을 엑셀 버퍼로 변환합니다. */
export async function recentAttendanceRateToExcel(data: AttendanceRateRow[]): Promise<Buffer> {
  return attendanceToExcel(data);
}

/** (조직, 사용자, 예배, 출석상태)별 횟수를 사용자당 한 행으로 펼치고 출석률을 계산합니다. */
function toRateRows(rows: CountRow[]): AttendanceRateRow[] {
  const counts = new Map<
    string,
    { organization_name: string; user_name: string; present: number[]; absent: number[] }
  >();

  for (const r of rows) {
    const key = `${r.organization_name}:${r.user_id}`;
    let entry = counts.get(key);
    if (!entry) {
      entry = {
        organization_name: r.organization_name,
        user_name: r.user_name,
        present: SERVICES.map(() => 0),
        absent: SERVICES.map(() => 0),
      };
      counts.set(key, entry);
    }

    const idx = SERVICES.findIndex(
      (s) => r.activity_name && s.activityNames.includes(r.activity_name),
    );
    if (idx === -1) continue;
    if (r.attendance_status === ATTENDANCE_STATUS.PRESENT) entry.present[idx] += Number(r.count);
    if (r.attendance_status === ATTENDANCE_STATUS.ABSENT) entry.absent[idx] += Number(r.count);
  }

  return [...counts.values()].map((e) => {
    const row: AttendanceRateRow = {
      organization_name: e.organization_name,
      user_name: e.user_name,
    };
    SERVICES.forEach((s, i) => {
      const total = e.present[i] + e.absent[i];
      row[`${s.label} 출석`] = e.present[i];
      row[`${s.label} 결석`] = e.absent[i];
      row[`${s.label} 출석률(%)`] =
        total > 0 ? Math.round((e.present[i] / total) * 1000) / 10 : null;
    });
    return row;
  });
}
