import { Op, col, fn } from "sequelize";
import models from "../../models/models.js";

/**
 * 청년예배 출석 트렌드를 조회하는 메서드
 * 현재가 12월이면 올해 12월 첫 일요일부터, 그 외 달이면 작년 12월 첫 일요일부터
 * 최근 일요일까지의 주차별 출석 데이터를 제공합니다.
 * 전체 조직의 청년예배 출석 수를 집계합니다.
 *
 * @returns {Object} 주차별 청년예배 출석 트렌드 데이터
 */
const getYoungAdultAttendanceTrend = async () => {
	const now = new Date();
	const currentMonth = now.getMonth();

	let targetYear;
	if (currentMonth === 11) {
		targetYear = now.getFullYear();
	} else {
		targetYear = now.getFullYear() - 1;
	}

	const decemberFirst = new Date(targetYear, 11, 1);
	const firstSundayOfDecember = new Date(decemberFirst);

	const dayOfWeek = decemberFirst.getDay();
	if (dayOfWeek !== 0) {
		firstSundayOfDecember.setDate(decemberFirst.getDate() + (7 - dayOfWeek));
	}

	const attendanceData = await models.Activity.findAll({
		where: {
			name: "청년예배",
			start_time: {
				[Op.gte]: firstSundayOfDecember,
			},
		},
		include: [
			{
				model: models.Attendance,
				as: "attendances",
				attributes: [],
				required: true,
				where: { attendance_status: "출석" },
			},
		],
		attributes: ["start_time", [fn("COUNT", col("attendances.id")), "count"]],
		group: ["Activity.id", "Activity.start_time"],
		order: [["start_time", "ASC"]],
		raw: true,
	});

	const weeklyData = [];
	const currentDate = new Date();

	const sundayDates = [];
	let currentSunday = new Date(firstSundayOfDecember);

	while (currentSunday <= currentDate) {
		sundayDates.push(new Date(currentSunday));
		currentSunday.setDate(currentSunday.getDate() + 7);
	}

	sundayDates.forEach((sundayDate) => {
		const weekStart = new Date(sundayDate);
		const weekEnd = new Date(sundayDate);
		weekEnd.setDate(weekEnd.getDate() + 6);

		const weekAttendance = attendanceData.filter((activity) => {
			const activityDate = new Date(activity.start_time);
			return activityDate >= weekStart && activityDate <= weekEnd;
		});

		const totalCount = weekAttendance.reduce(
			(sum, activity) => sum + parseInt(activity.count),
			0
		);

		const month = sundayDate.getMonth() + 1;
		const weekNumber = Math.ceil(
			(sundayDate.getDate() +
				new Date(sundayDate.getFullYear(), sundayDate.getMonth(), 0).getDay()) /
				7
		);

		weeklyData.push({
			xAxisName: `${month}월 ${weekNumber}주차`,
			count: totalCount,
		});
	});

	const maxCount =
		weeklyData.length > 0
			? Math.max(...weeklyData.map((item) => item.count))
			: 0;
	const yAxisMax = Math.ceil(maxCount / 50) * 50;

	return {
		weeklySundayYoungAdultAttendanceTrends: {
			xAxis: weeklyData,
			yAxisMax: yAxisMax,
		},
	};
};

export default getYoungAdultAttendanceTrend;
