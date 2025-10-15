import { Op } from "sequelize";
import models from "../../models/models.js";
import organizationService from "../organization/organization.js";

const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

/**
 * 최근 4주간의 연속 출석/결석 횟수를 계산하는 메서드
 * 최근 모임부터 역순으로 확인하여 연속성을 판단합니다.
 *
 * @param {Array} serviceAttendanceData - 특정 서비스(예배)의 출석 데이터 배열
 * @returns {Object} { attendCount: {}, absenceCount: {} } - 유저별 연속 출석/결석 횟수
 *
 * 예시:
 * - 4주전: 출석, 3주전: 출석, 2주전: 결석, 1주전: 출석 → 1주 연속 출석
 * - 4주전: 결석, 3주전: 출석, 2주전: 출석, 1주전: 출석 → 3주 연속 출석
 */
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

/**
 * 최근 4주간의 연속 출석/결석 멤버 정보를 조회하는 메서드
 * 각 서비스(주일예배, 청년예배, 수요청년예배, 금요청년예배)별로 연속 출석/결석 멤버를 분류합니다.
 *
 * @param {string} gook - 구역 정보
 * @param {string} group - 그룹 정보
 * @param {string} soon - 순 정보
 * @returns {Object} 각 서비스별 연속 출석/결석 멤버 데이터
 */
const getContinuousMembers = async (gook, group, soon) => {
	const organizations =
		await organizationService.getOrganizationsByGookAndGroup(gook, group, soon);
	const organizationIds = organizations.map((org) => org.id);
	const organizationNameMap = {};
	organizations.forEach((org) => {
		organizationNameMap[org.id] = org.name;
	});
	const attendanceData = await models.Activity.findAll({
		include: [
			{
				model: models.Attendance,
				as: "attendances",
				required: true,
				include: [
					{
						model: models.User,
						as: "user",
						required: true,
						include: [
							{
								model: models.UserRole,
								as: "userRoles",
								required: true,
								include: [
									{
										model: models.Role,
										as: "role",
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
				const userRoles = Array.isArray(attendance.user?.userRoles)
					? attendance.user.userRoles
					: [];

				const primaryRoleName =
					userRoles.length > 0 && userRoles[0]?.role
						? userRoles[0].role.name
						: null; // TODO: 다중 역할 처리 시 역할명 배열로 확장 고려

				allUserMap[userId] = {
					name: attendance.user.name,
					role: primaryRoleName,
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

				// 정확히 N주 연속 결석자만 해당 카테고리에 포함
				if (continuousCount === 4) {
					result[4].push(userData);
				} else if (continuousCount === 3) {
					result[3].push(userData);
				} else if (continuousCount === 2) {
					result[2].push(userData);
				}
			}
		});

		return result;
	};

	const countAttendees = (serviceData) => {
		const result = {
			4: [],
			3: [],
			2: [],
		};

		Object.keys(serviceData.attendCount).forEach((userId) => {
			const continuousCount = serviceData.attendCount[userId];
			const userInfo = allUserMap[userId];

			// 연속 출석자는 role이 '순원'인 경우만 집계
			if (userInfo && userInfo.role === "순원") {
				const userData = {
					name: userInfo.name,
					role: userInfo.role,
					organization: userInfo.organization,
				};

				// 정확히 N주 연속 출석자만 해당 카테고리에 포함
				if (continuousCount === 4) {
					result[4].push(userData);
				} else if (continuousCount === 3) {
					result[3].push(userData);
				} else if (continuousCount === 2) {
					result[2].push(userData);
				}
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
};

export default getContinuousMembers;
