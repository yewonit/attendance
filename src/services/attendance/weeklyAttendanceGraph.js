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
	let organizations = await organizationService.getOrganizationsByGookAndGroup(
		gook,
		group,
		soon
	);

	// 항상 '순'으로 끝나는 조직만 필터링
	organizations = organizations.filter((org) => org.name.endsWith("순"));

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

	// 조직 이름을 attendanceData에 매핑
	const attendanceDataWithOrgName = attendanceData.map((att) => {
		const org = organizations.find((o) => o.id === att.organization_id);
		return {
			...att,
			orgName: org?.name || "",
		};
	});

	let attendanceXAxis = [];
	let attendanceCounts = [];
	const attendanceAggregationSum = buildServiceData(0, 0, 0, 0);
	const attendanceAggregationAverage = buildServiceData(0, 0, 0, 0);

	// 조건에 따른 집계 로직
	if (!gook && !group) {
		// 둘 다 null이면 국별로 집계 (1국, 2국, 3국...)
		const gookMap = new Map();

		attendanceDataWithOrgName.forEach((att) => {
			const gookMatch = att.orgName.match(/^(\d+국)/);
			if (gookMatch) {
				const gookName = gookMatch[1];
				if (!gookMap.has(gookName)) {
					gookMap.set(gookName, buildServiceData(0, 0, 0, 0));
				}
				const serviceData = gookMap.get(gookName);

				if (att.name === "주일2부예배" || att.name === "주일3부예배")
					serviceData.sunday += att.count;
				else if (att.name === "청년예배")
					serviceData.sundayYoungAdult += att.count;
				else if (att.name === "수요청년예배")
					serviceData.wednesdayYoungAdult += att.count;
				else if (att.name === "금요청년예배")
					serviceData.fridayYoungAdult += att.count;
			}
		});

		attendanceXAxis = Array.from(gookMap.keys()).sort((a, b) => {
			const aNum = parseInt(a.replace("국", ""));
			const bNum = parseInt(b.replace("국", ""));
			return aNum - bNum;
		});
		attendanceCounts = attendanceXAxis.map((gookName) => gookMap.get(gookName));
	} else if (gook && !group) {
		// group만 null이면 그룹별로 집계 (3국_김보연그룹, 3국_문민철그룹...)
		const groupMap = new Map();

		attendanceDataWithOrgName.forEach((att) => {
			const groupMatch = att.orgName.match(/^(\d+국_[^_]+그룹)/);
			if (groupMatch) {
				const groupName = groupMatch[1];
				if (!groupMap.has(groupName)) {
					groupMap.set(groupName, buildServiceData(0, 0, 0, 0));
				}
				const serviceData = groupMap.get(groupName);

				if (att.name === "주일2부예배" || att.name === "주일3부예배")
					serviceData.sunday += att.count;
				else if (att.name === "청년예배")
					serviceData.sundayYoungAdult += att.count;
				else if (att.name === "수요청년예배")
					serviceData.wednesdayYoungAdult += att.count;
				else if (att.name === "금요청년예배")
					serviceData.fridayYoungAdult += att.count;
			}
		});

		attendanceXAxis = Array.from(groupMap.keys()).sort();
		attendanceCounts = attendanceXAxis.map((groupName) =>
			groupMap.get(groupName)
		);
	} else {
		// 기존 로직: 순별로 집계
		organizationIds.forEach((id) => {
			const orgName = organizations.find((org) => org.id === id)?.name;
			if (orgName) {
				attendanceXAxis.push(orgName);
			}

			const serviceMap = buildServiceData(0, 0, 0, 0);
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
	}

	// 전체 합계 계산
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

	// 평균 계산
	const orgCount = attendanceCounts.length;
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

	const attendanceYAxisMax =
		attendanceCounts.length > 0
			? Math.floor(
					Math.max(
						...attendanceCounts.map((data) =>
							Math.max(
								data.sunday,
								data.sundayYoungAdult,
								data.wednesdayYoungAdult,
								data.fridayYoungAdult
							)
						)
					) / 10
			  ) *
					10 +
			  10
			: 10;

	return {
		attendanceXAxis,
		attendanceYAxisMax,
		attendanceCounts,
		attendanceAggregationSum,
		attendanceAggregationAverage,
	};
};

export default getWeeklyAttendanceGraph;
