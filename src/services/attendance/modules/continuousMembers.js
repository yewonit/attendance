import { Op } from "sequelize";
import models from "../../../models/models.js";
import organizationService from "../../organization/organization.js";

const ROLE_IDS = {
	MEMBER: 5,
};

const ACTIVITY_TYPES = {
	SUNDAY: "주일3부예배",
	SUNDAY_YOUNG_ADULT: "청년예배",
	WEDNESDAY_YOUNG_ADULT: "수요청년예배",
	FRIDAY_YOUNG_ADULT: "금요청년예배",
};

const WEEK_THRESHOLDS = {
	FOUR_WEEKS: 4,
	THREE_WEEKS: 3,
	TWO_WEEKS: 2,
};

const filterByCount = (dataList, count, isGreaterOrEqual = false) => {
	return dataList
		.filter((data) => 
			isGreaterOrEqual 
				? data.attendance_continuous_count >= count 
				: data.attendance_continuous_count === count
		)
		.map((data) => data.user.id);
};

const filterByAbsenceCount = (dataList, count, isGreaterOrEqual = false) => {
	return dataList
		.filter((data) => 
			isGreaterOrEqual 
				? data.absence_continuous_count >= count 
				: data.absence_continuous_count === count
		)
		.map((data) => data.user.id);
};

const buildWeeklyStats = (dataList, allUserMap) => {
	const fourWeeks = filterByCount(dataList, WEEK_THRESHOLDS.FOUR_WEEKS, true);
	const threeWeeks = filterByCount(dataList, WEEK_THRESHOLDS.THREE_WEEKS);
	const twoWeeks = filterByCount(dataList, WEEK_THRESHOLDS.TWO_WEEKS);

	return {
		"4weeks": fourWeeks.map((id) => allUserMap[id]),
		"3weeks": threeWeeks.map((id) => allUserMap[id]),
		"2weeks": twoWeeks.map((id) => allUserMap[id]),
	};
};

/**
 * 연속 출석/결석 현황 조회
 * 특정 국/구역/순의 조직에 속한 멤버들의 출석 집계 데이터를 조회하여
 * 연속 출석자 및 결석자 리스트를 반환합니다.
 * 
 * @param {string} gook - 국 이름
 * @param {string} group - 구역 이름
 * @param {string} soon - 순 이름
 * @returns {Promise<Object>} 연속 결석자 리스트와 활동별 연속 출석자 현황
 */
const getContinuousMembers = async (gook, group, soon) => {
	const organizations =
		await organizationService.getOrganizationsByGookAndGroup(gook, group, soon);
	const organizationIds = organizations.map((org) => org.id);
	const organizationNameMap = organizations.reduce((map, org) => {
		map[org.id] = org.name;
		return map;
	}, {});

	// 깊은 nested include 구조에서 서브쿼리 문제 방지를 위해 subQuery: false 옵션 추가
	const aggregatedData = await models.UserAttendanceAggregate.findAll({
		subQuery: false,
		include: [
			{
				model: models.User,
				as: "user",
				attributes: ["id", "name"],
				where: { is_deleted: false },
				include: [
					{
						model: models.UserRole,
						as: "userRoles",
						attributes: ["organization_id", "role_id"],
						required: true,
						where: {
							organization_id: { [Op.in]: organizationIds },
							// role_id 조건을 UserRole 테이블에서 직접 체크 (Role 테이블의 PK는 id임)
							role_id: ROLE_IDS.MEMBER
						},
						include: [
							{
								model: models.Role,
								as: "role",
								attributes: ["id", "name"],
								required: false,
							},
						],
					},
				],
			}
		]
	});

	const allUserMap = aggregatedData.reduce((map, data) => {
		const user = data.user;
		if (!map[user.id]) {
			const userRoles = Array.isArray(user.userRoles) ? user.userRoles : [];
			const primaryRole = userRoles[0] || null;

			map[user.id] = {
				name: user.name,
				role: primaryRole?.role?.name || null,
				organization: primaryRole ? organizationNameMap[primaryRole.organization_id] : null,
			};
		}
		return map;
	}, {});

	const activityTypeMap = {
		sunday: [],
		sundayYoungAdult: [],
		wednesdayYoungAdult: [],
		fridayYoungAdult: [],
	};

	aggregatedData.forEach((data) => {
		switch (data.activity_type) {
			case ACTIVITY_TYPES.SUNDAY:
				activityTypeMap.sunday.push(data);
				break;
			case ACTIVITY_TYPES.SUNDAY_YOUNG_ADULT:
				activityTypeMap.sundayYoungAdult.push(data);
				break;
			case ACTIVITY_TYPES.WEDNESDAY_YOUNG_ADULT:
				activityTypeMap.wednesdayYoungAdult.push(data);
				break;
			case ACTIVITY_TYPES.FRIDAY_YOUNG_ADULT:
				activityTypeMap.fridayYoungAdult.push(data);
				break;
		}
	});

	const sundayData = activityTypeMap.sunday;
	const fourWeeksAbsent = filterByAbsenceCount(sundayData, WEEK_THRESHOLDS.FOUR_WEEKS, true);
	const threeWeeksAbsent = filterByAbsenceCount(sundayData, WEEK_THRESHOLDS.THREE_WEEKS);
	const twoWeeksAbsent = filterByAbsenceCount(sundayData, WEEK_THRESHOLDS.TWO_WEEKS);

	return {
		absenteeList: {
			"4weeks": fourWeeksAbsent.map((id) => allUserMap[id]),
			"3weeks": threeWeeksAbsent.map((id) => allUserMap[id]),
			"2weeks": twoWeeksAbsent.map((id) => allUserMap[id]),
		},
		continuousAttendeeCount: {
			sunday: buildWeeklyStats(activityTypeMap.sunday, allUserMap),
			sundayYoungAdult: buildWeeklyStats(activityTypeMap.sundayYoungAdult, allUserMap),
			wednesdayYoungAdult: buildWeeklyStats(activityTypeMap.wednesdayYoungAdult, allUserMap),
			fridayYoungAdult: buildWeeklyStats(activityTypeMap.fridayYoungAdult, allUserMap),
		},
	};
};

export default getContinuousMembers;
