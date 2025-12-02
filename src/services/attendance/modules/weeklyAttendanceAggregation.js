import { Op } from "sequelize";
import models from "../../../models/models.js";
import seasonService from "../../season/season.js";
import activityService from "../../activity/activity.js";
import organizationService from "../../organization/organization.js";

const seasonId = seasonService.getCurrentSeasonId();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

/**
 * 주간 출석 집계 데이터를 조회하는 메서드 (성능 최적화 버전)
 * - 독립적인 쿼리들을 병렬 실행하여 응답 시간 단축
 * - Promise.all을 활용한 동시 처리
 * 
 * 이번 주와 지난 주의 출석 현황을 비교하여 제공합니다.
 *
 * @param {string} gook - 구역 정보
 * @param {string} group - 그룹 정보
 * @param {string} soon - 순 정보
 * @returns {Object} 주간 출석 집계 데이터
 * 
 * TODO: 결과 캐싱 고려 (1시간 TTL)
 */
const getWeeklyAttendanceAggregation = async (gook, group, soon) => {
	const organizationIds =
		await organizationService.getOrganizationIdsByGookAndGroup(
			gook,
			group,
			soon
		);

	// 배열에서 ID 값들만 추출
	const organizationIdArray = organizationIds.map(org => org.id);

	// 1️⃣ 독립적인 쿼리들을 병렬로 실행
	const [
		allMemberIds,
		lastWeekAllMemberIds,
		lastSundayYoungAdultServiceIds,
		twoWeeksAgoSundayYoungAdultServiceIds,
		weeklyNewMemberCount,
		lastWeekNewMemberCount
	] = await Promise.all([
		// 총 인원
		models.UserRole.findAll({
			include: [
				{
					model: models.Organization,
					as: "organization",
					required: true,
					attributes: [],
					where: { season_id: seasonId },
				},
			],
			where: { organization_id: { [Op.in]: organizationIdArray } },
			attributes: ["user_id"],
		}),
		// 지난 주 기준 총 인원
		models.UserRole.findAll({
			include: [
				{
					model: models.Organization,
					as: "organization",
					required: true,
					attributes: [],
					where: { season_id: seasonId },
				},
			],
			where: {
				organization_id: { [Op.in]: organizationIdArray },
				created_at: { [Op.lt]: oneWeekAgo },
			},
			attributes: ["user_id"],
		}),
		// 이번 주 청년예배 활동 ID
		activityService.getLastSundayYoungAdultServiceIds(organizationIdArray),
		// 지난 주 청년예배 활동 ID
		activityService.get2WeeksAgoSundayYoungAdultServiceIds(organizationIdArray),
		// 이번 주 신규 가족
		models.UserRole.findAll({
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					where: {
						is_new_member: true,
						registration_date: { [Op.gte]: oneWeekAgo },
					},
					attributes: ["id"],
				},
				{
					model: models.Organization,
					as: "organization",
					required: true,
					attributes: [],
					where: { season_id: seasonId },
				},
			],
			where: {
				organization_id: { [Op.in]: organizationIdArray },
			},
			attributes: ["user_id"],
		}),
		// 지난 주 신규 가족
		models.UserRole.findAll({
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					where: {
						is_new_member: true,
						registration_date: {
							[Op.gte]: twoWeeksAgo,
							[Op.lt]: oneWeekAgo,
						},
					},
					attributes: ["id"],
				},
				{
					model: models.Organization,
					as: "organization",
					required: true,
					attributes: [],
					where: { season_id: seasonId },
				},
			],
			where: {
				organization_id: { [Op.in]: organizationIdArray },
			},
			attributes: ["user_id"],
		}),
	]);

	// 2️⃣ 출석 인원 조회도 병렬로 실행
	const [weeklyAttendanceMemberCount, lastWeekAttendanceMemberCount] = await Promise.all([
		// 이번 주 출석 인원
		models.Attendance.findAll({
			where: {
				user_id: { [Op.in]: allMemberIds.map(member => member.user_id) },
				activity_id: { [Op.in]: lastSundayYoungAdultServiceIds },
				attendance_status: "출석",
			},
			attributes: ["id"],
		}),
		// 지난 주 출석 인원
		models.Attendance.findAll({
			where: {
				user_id: { [Op.in]: lastWeekAllMemberIds.map(member => member.user_id) },
				activity_id: { [Op.in]: twoWeeksAgoSundayYoungAdultServiceIds },
				attendance_status: "출석",
			},
			attributes: ["id"],
		}),
	]);

	return {
		allMemberCount: allMemberIds.length,
		weeklyAttendanceMemberCount: weeklyAttendanceMemberCount.length,
		weeklyNewMemberCount: weeklyNewMemberCount.length,
		attendanceRate:
			allMemberIds.length > 0
				? weeklyAttendanceMemberCount.length / allMemberIds.length * 100
				: 0,
		lastWeek: {
			allMemberCount: lastWeekAllMemberIds.length,
			weeklyAttendanceMemberCount: lastWeekAttendanceMemberCount.length,
			weeklyNewMemberCount: lastWeekNewMemberCount.length,
			attendanceRate:
				lastWeekAllMemberIds.length > 0
					? lastWeekAttendanceMemberCount.length / lastWeekAllMemberIds.length * 100
					: 0,
		},
	};
};

export default getWeeklyAttendanceAggregation;
