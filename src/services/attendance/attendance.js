import { Op, col, fn } from "sequelize";
import models from "../../models/models.js";
import { getCurrentSeasonId } from "../../utils/season.js";
import activityService from "../activity/activity.js";
import organizationService from "../organization/organization.js";

const seasonId = getCurrentSeasonId();

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

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

const attendanceService = {
	getWeeklyAttendanceAggregation: async (gook, group, soon) => {
		const organizationIds =
			await organizationService.getOrganizationIdsByGookAndGroup(
				gook,
				group,
				soon
			);

		// 총 인원
		const allMemberIds = await models.UserRole.findAll({
			where: {
				season_id: seasonId,
				organization_id: {
					[Op.in]: organizationIds,
				},
			},
			attributes: ["id"],
		});
		// 지난 주 기준 총 인원
		const lastWeekAllMemberIds = await models.UserRole.findAll({
			where: {
				season_id: seasonId,
				organization_id: {
					[Op.in]: organizationIds,
				},
				created_at: {
					[Op.lt]: oneWeekAgo,
				},
			},
			attributes: ["id"],
		});
		// 이번 주 출석 인원
		const lastSundayYoungAdultServiceIds =
			await activityService.getLastSundayYoungAdultServiceIds(organizationIds);
		const weeklyAttendanceMemberCount = await models.Attendance.findAll({
			where: {
				user_id: {
					[Op.in]: allMemberIds,
				},
				activity_id: {
					[Op.in]: lastSundayYoungAdultServiceIds,
				},
				attendance_status: "출석",
			},
		});
		// 지난 주 출석 인원
		const twoWeeksAgoSundayYoungAdultServiceIds =
			await activityService.get2WeeksAgoSundayYoungAdultServiceIds(
				organizationIds
			);
		const lastWeekAttendanceMemberCount = await models.Attendance.findAll({
			where: {
				user_id: {
					[Op.in]: lastWeekAllMemberIds,
				},
				activity_id: {
					[Op.in]: twoWeeksAgoSundayYoungAdultServiceIds,
				},
				attendance_status: "출석",
			},
		});
		// 이번 주 신규 가족
		const weeklyNewMemberCount = await models.User.findAll({
			where: {
				is_new_member: true,
				registration_date: {
					[Op.gte]: oneWeekAgo,
				},
			},
		});
		// 지난 주 신규 가족
		const lastWeekNewMemberCount = await models.User.findAll({
			where: {
				is_new_member: true,
				registration_date: {
					[Op.gte]: twoWeeksAgo,
					[Op.lt]: oneWeekAgo,
				},
			},
		});

		return {
			allMemberCount: allMemberIds.length,
			weeklyAttendanceMemberCount: weeklyAttendanceMemberCount.length,
			weeklyNewMemberCount: weeklyNewMemberCount.length,
			attendanceRate: weeklyAttendanceMemberCount.length / allMemberIds.length,
			lastWeek: {
				allMemberCount: lastWeekAllMemberIds.length,
				weeklyAttendanceMemberCount: lastWeekAttendanceMemberCount.length,
				weeklyNewMemberCount: lastWeekNewMemberCount.length,
				attendanceRate:
					lastWeekAttendanceMemberCount.length / lastWeekAllMemberIds.length,
			},
		};
	},

	getWeeklyAttendanceGraph: async (gook, group, soon) => {
		const organizations =
			await organizationService.getOrganizationsByGookAndGroup(
				gook,
				group,
				soon
			);
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
			Math.floor(Math.max(attendanceData.map((data) => data.count)) / 10) + 1;
		const attendanceCounts = [];
		const attendanceAggregationSum = initServiceData();
		const attendanceAggregationAverage = initServiceData();

		organizationIds.forEach((id) => {
			attendanceXAxis.push(
				organizations.filter((org) => org.id === id).map((org) => org.name)
			);

			const serviceMap = initServiceData();
			attendanceData
				.filter((att) => (att.organization_id = id))
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

		return {
			attendanceXAxis,
			attendanceYAxisMax,
			attendanceCounts,
			attendanceAggregationSum,
			attendanceAggregationAverage,
		};
	},

	getContinuousMembers: async (gook, group, soon) => {
		const organizations =
			await organizationService.getOrganizationsByGookAndGroup(
				gook,
				group,
				soon
			);
		const organizationIds = organizations.map((org) => org.id);
		const organizationNameMap = {};
		organizations.forEach((org) => {
			organizationNameMap[org.id] = org.name;
		});
		const attendanceData = await models.Activity.findAll({
			include: [
				{
					model: Attendance,
					as: "attendances",
					required: true,
					include: [
						{
							model: models.User,
							as: "users",
							required: true,
							include: [
								{
									model: models.UserRole,
									as: "userRoles",
									required: true,
									include: [
										{
											model: models.Role,
											as: "roles",
											required: true,
										},
									],
								},
							],
						},
					],
				},
			],
			where: {
				organization_id: {
					[Op.in]: organizationIds,
				},
				is_deleted: false,
				start_time: {
					[Op.gte]: fourWeeksAgo,
				},
			},
			order: [["start_time", "DESC"]],
		});

		const allUserMap = {};
		attendanceData.forEach((activity) => {
			activity.attendances.forEach((attendance) => {
				const userId = attendance.user_id;
				if (!allUserMap[userId]) {
					allUserMap[userId] = {
						name: attendance.users.name,
						role: attendance.users.userRoles.roles.name,
						organization: organizationNameMap[activity.organization_id],
					};
				}
			});
		});

		const sundayData = await aggregateContinuous(
			attendanceData.filter((att) => att.name === "주일3부예배")
		);
		const sundayYoungAdultData = await aggregateContinuous(
			attendanceData.filter((att) => att.name === "청년예배")
		);
		const wednesdayYoungAdultData = await aggregateContinuous(
			attendanceData.filter((att) => att.name === "수요청년예배")
		);
		const fridayYoungAdultData = await aggregateContinuous(
			attendanceData.filter((att) => att.name === "금요청년예배")
		);

		const categorizeAbsentees = (serviceData) => {
			const result = {
				4: [],
				3: [],
				2: [],
			};

			Object.keys(serviceData.absenceCount).forEach((userId) => {
				const userInfo = allUserMap[userId];
				const continuousCount = serviceData.absenceCount[userId];

				if (userInfo && continuousCount >= 2) {
					const userData = {
						name: userInfo.name,
						role: userInfo.role,
						organization: userInfo.organization,
					};

					if (continuousCount >= 4) {
						result[4].push(userData);
					} else if (continuousCount >= 3) {
						result[3].push(userData);
					} else if (continuousCount >= 2) {
						result[2].push(userData);
					}
				}
			});

			return result;
		};

		const countAttendees = (serviceData) => {
			const result = {
				4: 0,
				3: 0,
				2: 0,
			};

			Object.keys(serviceData.attendCount).forEach((userId) => {
				const continuousCount = serviceData.attendCount[userId];

				if (continuousCount >= 4) {
					result[4]++;
				} else if (continuousCount >= 3) {
					result[3]++;
				} else if (continuousCount >= 2) {
					result[2]++;
				}
			});

			return result;
		};

		const allAbsenteeData = {
			sunday: categorizeAbsentees(sundayData),
			sundayYoungAdult: categorizeAbsentees(sundayYoungAdultData),
			wednesdayYoungAdult: categorizeAbsentees(wednesdayYoungAdultData),
			fridayYoungAdult: categorizeAbsentees(fridayYoungAdultData),
		};

		const absenteeList = {
			4: new Set(),
			3: new Set(),
			2: new Set(),
		};

		Object.keys(allAbsenteeData).forEach((service) => {
			[4, 3, 2].forEach((week) => {
				allAbsenteeData[service][week].forEach((user) => {
					const userKey = `${user.name}-${user.organization}`;
					absenteeList[week].add(JSON.stringify(user));
				});
			});
		});

		const finalAbsenteeList = {
			4: Array.from(absenteeList[4]).map((userStr) => JSON.parse(userStr)),
			3: Array.from(absenteeList[3]).map((userStr) => JSON.parse(userStr)),
			2: Array.from(absenteeList[2]).map((userStr) => JSON.parse(userStr)),
		};

		return {
			absenteeList: {
				"4weeks": finalAbsenteeList[4],
				"3weeks": finalAbsenteeList[3],
				"2weeks": finalAbsenteeList[2],
			},
			continuousAttendeeCount: {
				sunday: {
					"4weeks": countAttendees(sundayData)[4],
					"3weeks": countAttendees(sundayData)[3],
					"2weeks": countAttendees(sundayData)[2],
				},
				sundayYoungAdult: {
					"4weeks": countAttendees(sundayYoungAdultData)[4],
					"3weeks": countAttendees(sundayYoungAdultData)[3],
					"2weeks": countAttendees(sundayYoungAdultData)[2],
				},
				wednesdayYoungAdult: {
					"4weeks": countAttendees(wednesdayYoungAdultData)[4],
					"3weeks": countAttendees(wednesdayYoungAdultData)[3],
					"2weeks": countAttendees(wednesdayYoungAdultData)[2],
				},
				fridayYoungAdult: {
					"4weeks": countAttendees(fridayYoungAdultData)[4],
					"3weeks": countAttendees(fridayYoungAdultData)[3],
					"2weeks": countAttendees(fridayYoungAdultData)[2],
				},
			},
		};
	},

	getYoungAdultAttendanceTrend: async () => {
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
					required: true,
					where: { attendance_status: "출석" },
					attributes: [],
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
					new Date(
						sundayDate.getFullYear(),
						sundayDate.getMonth(),
						0
					).getDay()) /
					7
			);

			weeklyData.push({
				xAxisName: `${month}월 ${weekNumber}주차`,
				count: totalCount,
			});
		});

		const maxCount = Math.max(...weeklyData.map((item) => item.count));
		const yAxisMax = Math.ceil(maxCount / 50) * 50;

		return {
			weeklySundayYoungAdultAttendanceTrends: {
				xAxis: weeklyData,
				yAxisMax: yAxisMax,
			},
		};
	},
};

const aggregateContinuous = async (serviceAttendanceData) => {
	const attendCount = {};
	const absenceCount = {};

	const sortedData = serviceAttendanceData.sort(
		(a, b) => new Date(b.start_time) - new Date(a.start_time)
	);

	const userAttendanceMap = {};

	sortedData.forEach((activity) => {
		activity.attendances.forEach((attendance) => {
			const userId = attendance.user_id;
			const status = attendance.attendance_status;

			if (!userAttendanceMap[userId]) {
				userAttendanceMap[userId] = [];
			}

			userAttendanceMap[userId].push({
				status,
				date: activity.start_time,
			});
		});
	});

	Object.keys(userAttendanceMap).forEach((userId) => {
		const attendanceHistory = userAttendanceMap[userId];

		let currentStreak = 0;
		let currentStatus = null;

		for (let i = 0; i < attendanceHistory.length; i++) {
			const { status } = attendanceHistory[i];

			if (i === 0) {
				currentStatus = status;
				currentStreak = 1;
			} else {
				if (status === currentStatus) {
					currentStreak++;
				} else {
					break;
				}
			}
		}

		if (currentStatus === "출석") {
			attendCount[userId] = currentStreak;
		} else if (currentStatus === "결석") {
			absenceCount[userId] = currentStreak;
		}
	});

	return {
		attendCount,
		absenceCount,
	};
};

export default attendanceService;
