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

const getContinuousMembers = async (gook, group, soon) => {
	const organizations =
		await organizationService.getOrganizationsByGookAndGroup(gook, group, soon);
	const organizationIds = organizations.map((org) => org.id);
	const organizationNameMap = organizations.reduce((map, org) => {
		map[org.id] = org.name;
		return map;
	}, {});

	const aggregatedData = await models.UserAttendanceAggregate.findAll({
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
						attributes: ["organization_id"],
						required: true,
						where: { organization_id: { [Op.in]: organizationIds } },
						include: [
							{
								model: models.Role,
								as: "role",
								attributes: ["name"],
								required: true,
								where: { role_id: ROLE_IDS.MEMBER }
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
