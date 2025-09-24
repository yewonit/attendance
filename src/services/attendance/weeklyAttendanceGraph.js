import { Op, col, fn } from "sequelize";
import models from "../../models/models.js";
import organizationService from "../organization/organization.js";

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const buildServiceData = (
	sunday,
	sundayYoungAdult,
	wednesdayYoungAdult,
	fridayYoungAdult
) => {
	return {
		sunday,
		sundayYoungAdult,
		wednesdayYoungAdult,
		fridayYoungAdult,
	};
};
const initServiceData = buildServiceData(0, 0, 0, 0);

/**
 * 주간 출석 그래프 데이터를 조회하는 메서드
 * 각 조직별 서비스(예배)별 출석 현황을 그래프용 데이터로 제공합니다.
 *
 * @param {string} gook - 구역 정보
 * @param {string} group - 그룹 정보
 * @param {string} soon - 순 정보
 * @returns {Object} 주간 출석 그래프 데이터
 */
const getWeeklyAttendanceGraph = async (gook, group, soon) => {
	const organizations =
		await organizationService.getOrganizationsByGookAndGroup(gook, group, soon);
	const organizationIds = organizations.map((org) => org.id);
	const attendanceData = await models.Activity.findAll({
		attributes: [
			"organization_id",
			"name",
			[fn("COUNT", col("attendances.id")), "count"],
		],
		include: [
			{
				model: models.Attendance,
				as: "attendances",
				attributes: [],
				required: true,
				where: { attendance_status: "출석" },
			},
		],
		where: {
			organization_id: { [Op.in]: organizationIds },
			start_time: { [Op.gt]: oneWeekAgo },
		},
		group: ["Activity.id", "Activity.organization_id", "Activity.name"],
		raw: true,
	});

	const attendanceXAxis = [];
	const attendanceYAxisMax =
		attendanceData.length > 0
			? Math.floor(Math.max(attendanceData.map((data) => data.count)) / 10) + 1
			: 10;
	const attendanceCounts = [];
	const attendanceAggregationSum = initServiceData;
	const attendanceAggregationAverage = initServiceData;

	organizationIds.forEach((id) => {
		attendanceXAxis.push(
			organizations.filter((org) => org.id === id).map((org) => org.name)
		);

		const serviceMap = initServiceData;
		attendanceData
			.filter((att) => att.organization_id === id)
			.map((att) => {
				if (att.name === "주일2부예배" || att.name === "주일3부예배")
					serviceMap.sunday = att.count;
				else if (att.name === "청년예배")
					serviceMap.sundayYoungAdult = att.count;
				else if (att.name === "수요청년예배")
					serviceMap.wednesdayYoungAdult = att.count;
				else if (att.name === "금요청년예배")
					serviceMap.fridayYoungAdult = att.count;
			});

		attendanceCounts.push(serviceMap);
	});

	attendanceData.forEach((att) => {
		if (att.name === "주일2부예배" || att.name === "주일3부예배")
			attendanceAggregationSum.sunday += att.count;
		else if (att.name === "청년예배")
			attendanceAggregationSum.sundayYoungAdult += att.count;
		else if (att.name === "수요청년예배")
			attendanceAggregationSum.wednesdayYoungAdult += att.count;
		else if (att.name === "금요청년예배")
			attendanceAggregationSum.fridayYoungAdult += att.count;
	});

	const orgCount = organizationIds.length;
	if (orgCount > 0) {
		attendanceAggregationAverage.sunday = Math.floor(
			attendanceAggregationSum.sunday / orgCount
		);
		attendanceAggregationAverage.sundayYoungAdult = Math.floor(
			attendanceAggregationSum.sundayYoungAdult / orgCount
		);
		attendanceAggregationAverage.wednesdayYoungAdult = Math.floor(
			attendanceAggregationSum.wednesdayYoungAdult / orgCount
		);
		attendanceAggregationAverage.fridayYoungAdult = Math.floor(
			attendanceAggregationSum.fridayYoungAdult / orgCount
		);
	}

	return {
		attendanceXAxis,
		attendanceYAxisMax,
		attendanceCounts,
		attendanceAggregationSum,
		attendanceAggregationAverage,
	};
};

export default getWeeklyAttendanceGraph;
