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
					model: Attendance,
					as: "attendances", // 실제 association alias에 맞게 조정
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
					as: "attendances", // 실제 association alias에 맞게 조정
					required: true,
					include: [
						{
							model: User,
							as: "users", // 실제 association alias에 맞게 조정
							required: true,
							include: [
								{
									model: UserRole,
									as: "userRoles",
									required: true,
									include: [
										{
											model: role,
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

		// 연속 결석자 목록을 주차별로 분류하는 함수
		const categorizeAbsentees = (serviceData) => {
			const result = {
				4: [], // 4주 연속 결석자
				3: [], // 3주 연속 결석자
				2: [], // 2주 연속 결석자
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

		// 연속 출석자 수를 주차별로 집계하는 함수
		const countAttendees = (serviceData) => {
			const result = {
				4: 0, // 4주 연속 출석자 수
				3: 0, // 3주 연속 출석자 수
				2: 0, // 2주 연속 출석자 수
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

		// 모든 서비스의 연속 결석자를 통합하여 주차별로 분류
		const allAbsenteeData = {
			sunday: categorizeAbsentees(sundayData),
			sundayYoungAdult: categorizeAbsentees(sundayYoungAdultData),
			wednesdayYoungAdult: categorizeAbsentees(wednesdayYoungAdultData),
			fridayYoungAdult: categorizeAbsentees(fridayYoungAdultData),
		};

		// 중복 제거를 위한 Set 사용
		const absenteeList = {
			4: new Set(),
			3: new Set(),
			2: new Set(),
		};

		// 모든 서비스의 결석자를 통합 (중복 제거)
		Object.keys(allAbsenteeData).forEach((service) => {
			[4, 3, 2].forEach((week) => {
				allAbsenteeData[service][week].forEach((user) => {
					const userKey = `${user.name}-${user.organization}`;
					absenteeList[week].add(JSON.stringify(user));
				});
			});
		});

		// Set을 배열로 변환
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
};

const aggregateContinuous = async (serviceAttendanceData) => {
	const attendCount = {};
	const absenceCount = {};

	// 시간순으로 정렬 (최신 모임이 먼저 오도록)
	const sortedData = serviceAttendanceData.sort(
		(a, b) => new Date(b.start_time) - new Date(a.start_time)
	);

	// 각 유저별로 출석 기록을 시간순으로 정리
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

	// 각 유저별로 연속 출석/결석 횟수 계산
	Object.keys(userAttendanceMap).forEach((userId) => {
		const attendanceHistory = userAttendanceMap[userId];

		// 최근 모임부터 연속성 확인
		let currentStreak = 0;
		let currentStatus = null;

		for (let i = 0; i < attendanceHistory.length; i++) {
			const { status } = attendanceHistory[i];

			if (i === 0) {
				// 첫 번째 모임 (가장 최근)
				currentStatus = status;
				currentStreak = 1;
			} else {
				// 이전 모임과 상태가 같으면 연속성 유지
				if (status === currentStatus) {
					currentStreak++;
				} else {
					// 상태가 바뀌면 연속성 종료
					break;
				}
			}
		}

		// 연속 출석 또는 연속 결석 횟수 저장
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
