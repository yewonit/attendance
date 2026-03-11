import { sequelize } from "../../../utils/database.js";
import seasonService from "../../season/season.js";
import { attendanceToExcel } from "./utils/excel.js";

/**
 * 특정 날짜 기준으로 가장 최근 일요일을 반환합니다.
 * @param {Date|string} date - 기준 날짜 (없으면 오늘)
 * @returns {Date} 가장 최근 일요일 날짜
 */
const getRecentSunday = (date) => {
	let today = new Date();
	if (date) {
		today = new Date(date);
	}
	const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

	// 오늘이 일요일이면 오늘, 아니면 지난 일요일
	const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
	const recentSunday = new Date(today);
	recentSunday.setDate(today.getDate() - daysToSubtract);
	recentSunday.setHours(0, 0, 0, 0);

	return recentSunday;
};

/**
 * 날짜를 YYYY-MM-DD 형식으로 포맷합니다.
 * @param {Date} date - 포맷할 날짜
 * @returns {string} YYYY-MM-DD 형식의 날짜 문자열
 */
const formatDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

/**
 * 날짜를 MM-DD 형식으로 포맷합니다.
 * @param {Date} date - 포맷할 날짜
 * @returns {string} MM-DD 형식의 날짜 문자열
 */
const formatDateShort = (date) => {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${month}-${day}`;
};

/**
 * 특정 날짜 기준 가장 최근 일요일의 예배 출석 현황을 조회합니다.
 * @param {Date|string} date - 기준 날짜 (없으면 오늘)
 * @returns {Promise<Array>} 조직별/사용자별 출석 현황 배열
 */
const getRecentSundayAttendance = async (date) => {
	const seasonId = await seasonService.getCurrentSeasonId();
	const recentSunday = getRecentSunday(date);
	const dateStr = formatDate(recentSunday);
	const shortDateStr = formatDateShort(recentSunday);

	// 다음 날 00:00:00 (해당 날짜의 끝)
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
    JOIN user_role ur
      ON ur.user_id = u.id
    JOIN organization o
      ON o.id = ur.organization_id
    LEFT JOIN attendance att
      ON att.user_id = u.id
    LEFT JOIN activity a
      ON a.id = att.activity_id
        AND a.start_time >= :startDate
        AND a.start_time < :endDate
        AND a.is_deleted = 0
    WHERE u.is_deleted = 0 AND o.season_id = :seasonId
    GROUP BY o.name, u.id, u.name
    ORDER BY o.name, u.id;
  `;

	const [results] = await sequelize.query(query, {
		replacements: {
			startDate: `${dateStr} 00:00:00`,
			endDate: `${nextDayStr} 00:00:00`,
			seasonId: seasonId,
		},
	});

	return results;
};

/**
 * 일요일 예배 출석 현황을 엑셀 파일(버퍼)로 변환합니다.
 * @param {Array} sundayAttendance - 출석 현황 배열
 * @returns {Promise<Buffer>} 엑셀 파일 버퍼
 */
const recentSundayAttendanceToExcel = async (sundayAttendance) => {
	return attendanceToExcel(sundayAttendance);
};

export { getRecentSunday, getRecentSundayAttendance, recentSundayAttendanceToExcel };
