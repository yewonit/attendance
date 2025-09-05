import { Op } from "sequelize";
import models from "../../models/models.js";
import { getCurrentSeasonId } from "../../utils/season.js";
import activityService from "../activity/activity.js";
import organizationService from "../organization/organization.js";

const seasonId = getCurrentSeasonId();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

/**
 * 주간 출석 집계 데이터를 조회하는 메서드
 * 이번 주와 지난 주의 출석 현황을 비교하여 제공합니다.
 *
 * @param {string} gook - 구역 정보
 * @param {string} group - 그룹 정보
 * @param {string} soon - 순 정보
 * @returns {Object} 주간 출석 집계 데이터
 */
const getWeeklyAttendanceAggregation = async (gook, group, soon) => {
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
		attendanceRate:
			allMemberIds.length > 0
				? weeklyAttendanceMemberCount.length / allMemberIds.length
				: 0,
		lastWeek: {
			allMemberCount: lastWeekAllMemberIds.length,
			weeklyAttendanceMemberCount: lastWeekAttendanceMemberCount.length,
			weeklyNewMemberCount: lastWeekNewMemberCount.length,
			attendanceRate:
				lastWeekAllMemberIds.length > 0
					? lastWeekAttendanceMemberCount.length / lastWeekAllMemberIds.length
					: 0,
		},
	};
};

export default getWeeklyAttendanceAggregation;
