import ExcelJS from "exceljs";
import { sequelize } from "../../../utils/database.js";

const getRecentSunday = () => {
	const today = new Date();
	const dayOfWeek = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일

	// 오늘이 일요일이면 오늘, 아니면 지난 일요일
	const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
	const recentSunday = new Date(today);
	recentSunday.setDate(today.getDate() - daysToSubtract);
	recentSunday.setHours(0, 0, 0, 0);

	return recentSunday;
};

const formatDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const formatDateShort = (date) => {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${month}-${day}`;
};

const getRecentSundayAttendance = async () => {
	const recentSunday = getRecentSunday();
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
    WHERE u.is_deleted = 0
    GROUP BY o.name, u.id, u.name
    ORDER BY o.name, u.id;
  `;

	const [results] = await sequelize.query(query, {
		replacements: {
			startDate: `${dateStr} 00:00:00`,
			endDate: `${nextDayStr} 00:00:00`,
		},
	});

	return results;
};

const recentSundayAttendanceToExcel = async (sundayAttendance) => {
	// 엑셀 워크북 생성
	const workbook = new ExcelJS.Workbook();

	// 조직별로 데이터 그룹핑
	const groupedByOrg = sundayAttendance.reduce((acc, row) => {
		const orgName = row.organization_name;
		if (!acc[orgName]) {
			acc[orgName] = [];
		}
		acc[orgName].push(row);
		return acc;
	}, {});

	// 전체 데이터를 하나의 시트로도 추가
	const allDataSheet = workbook.addWorksheet("전체");
	if (sundayAttendance.length > 0) {
		const columns = Object.keys(sundayAttendance[0]).map((key) => ({
			header:
				key === "organization_name"
					? "조직"
					: key === "user_name"
						? "이름"
						: key,
			key: key,
			width: 20,
		}));

		allDataSheet.columns = columns;

		sundayAttendance.forEach((row) => {
			allDataSheet.addRow(row);
		});

		// 헤더 스타일링
		allDataSheet.getRow(1).font = { bold: true };
		allDataSheet.getRow(1).alignment = {
			vertical: "middle",
			horizontal: "center",
		};
	}

	// 각 조직별로 시트 생성
	Object.keys(groupedByOrg).forEach((orgName) => {
		const worksheet = workbook.addWorksheet(orgName);
		const orgData = groupedByOrg[orgName];

		// 컬럼 정의 (첫 번째 데이터 행에서 추출)
		if (orgData.length > 0) {
			const columns = Object.keys(orgData[0]).map((key) => ({
				header:
					key === "organization_name"
						? "조직"
						: key === "user_name"
							? "이름"
							: key,
				key: key,
				width: 20,
			}));

			worksheet.columns = columns;

			// 데이터 추가
			orgData.forEach((row) => {
				worksheet.addRow(row);
			});

			// 헤더 스타일링
			worksheet.getRow(1).font = { bold: true };
			worksheet.getRow(1).alignment = {
				vertical: "middle",
				horizontal: "center",
			};
		}
	});

	// 버퍼로 변환
	const buffer = await workbook.xlsx.writeBuffer();
	return buffer;
};

export { getRecentSundayAttendance, recentSundayAttendanceToExcel };
