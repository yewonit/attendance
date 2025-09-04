import models from "../../models/models.js";
import { getCurrentSeasonId } from "../../utils/season.js";

const attendanceService = {
  getWeeklyAttendanceAggregation: async (gook, group) => {
    const seasonId = getCurrentSeasonId();
    const organizationIds = await organizationService.getOrganizationIdsByGookAndGroup(gook, group, null);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeekAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    // 총 인원
    const allMemberIds = await models.User.findAll({
      where: {
        season_id: seasonId,
        organization_id: {
          [Op.in]: organizationIds,
        },
      },
      attributes: ['id'],
    });
    // 지난 주 기준 총 인원
    const lastWeekAllMemberIds = await models.User.findAll({
      where: {
        season_id: seasonId,
        organization_id: {
          [Op.in]: organizationIds,
        },
        created_at: {
          [Op.lt]: oneWeekAgo,
        }
      },
      attributes: ['id'],
    });
    // 이번 주 출석 인원
    const lastSundayYoungAdultServiceIds = await activityService.getLastSundayYoungAdultServiceIds(organizationIds);
    const weeklyAttendanceMemberCount = await models.Attendance.findAll({
      where: {
        user_id: {
          [Op.in]: allMemberIds,
        },
        activity_id: {
          [Op.in]: lastSundayYoungAdultServiceIds,
        },
        attendance_status: '출석',
      }
    })
    // 지난 주 출석 인원
    const twoWeeksAgoSundayYoungAdultServiceIds = await activityService.get2WeeksAgoSundayYoungAdultServiceIds(organizationIds);
    const lastWeekAttendanceMemberCount = await models.Attendance.findAll({
      where: {
        user_id: {
          [Op.in]: lastWeekAllMemberIds,
        },
        activity_id: {
          [Op.in]: twoWeeksAgoSundayYoungAdultServiceIds,
        },
        attendance_status: '출석',
      }
    })
    // 이번 주 신규 가족
    const weeklyNewMemberCount = await models.User.findAll({
      where: {
        is_new_member: true,
        registration_date: {
          [Op.gte]: oneWeekAgo,
        },
      }
    })
    // 지난 주 신규 가족
    const lastWeekNewMemberCount = await models.User.findAll({
      where: {
        is_new_member: true,
        registration_date: {
          [Op.gte]: twoWeekAgo,
          [Op.lt]: oneWeekAgo,
        },
      }
    })

    return {
      allMemberCount: allMemberIds.length,
      weeklyAttendanceMemberCount: weeklyAttendanceMemberCount.length,
      weeklyNewMemberCount: weeklyNewMemberCount.length,
      attendanceRate: weeklyAttendanceMemberCount.length / allMemberIds.length,
      lastWeek: {
        allMemberCount: lastWeekAllMemberIds.length,
        weeklyAttendanceMemberCount: lastWeekAttendanceMemberCount.length,
        weeklyNewMemberCount: lastWeekNewMemberCount.length,
        attendanceRate: lastWeekAttendanceMemberCount.length / lastWeekAllMemberIds.length,
      }
    }
  }
}

export default attendanceService;