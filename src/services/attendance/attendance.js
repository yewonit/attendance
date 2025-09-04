import { Op, col, fn } from "sequelize";
import models from "../../models/models.js";
import { getCurrentSeasonId } from "../../utils/season.js";
import activityService from "../activity/activity.js";
import organizationService from "../organization/organization.js";

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const twoWeekAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const buildServiceData = (sunday, sundayYoungAdult, wednesdayYoungAdult, fridayYoungAdult) => {
  return {
    sunday,
    sundayYoungAdult,
    wednesdayYoungAdult,
    fridayYoungAdult
  }
}
const initServiceData = buildServiceData(0, 0, 0, 0)

const attendanceService = {
  getWeeklyAttendanceAggregation: async (gook, group, soon) => {
    const seasonId = getCurrentSeasonId();
    const organizationIds = await organizationService.getOrganizationIdsByGookAndGroup(gook, group, soon);

    // 총 인원
    const allMemberIds = await models.UserRole.findAll({
      where: {
        season_id: seasonId,
        organization_id: {
          [Op.in]: organizationIds,
        },
      },
      attributes: ['id'],
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
  },
  getWeeklyAttendanceGraph: async (gook, group, soon) => {
    const organizations = await organizationService.getOrganizationsByGookAndGroup(gook, group, soon)
    const organizationIds = organizations.map(org => org.id)
    const attendanceData = await models.Activity.findAll({
      attributes: [
        'organization_id',
        'name',
        [fn('COUNT', col('attendances.id')), 'count']
      ],
      include: [
        {
          model: Attendance,
          as: 'attendances',          // 실제 association alias에 맞게 조정
          attributes: [],
          required: true,
          where: { attendance_status: '출석' }
        }
      ],
      where: {
        organization_id: { [Op.in]: organizationIds },
        start_time: { [Op.gt]: oneWeekAgo }
      },
      group: ['Activity.id', 'Activity.organization_id', 'Activity.name'],
      raw: true
    });

    const attendanceXAxis = []
    const attendanceYAxisMax = Math.floor(Math.max(attendanceData.map(data => data.count)) / 10) + 1
    const attendanceCounts = []
    const attendanceAggregationSum = initServiceData()
    const attendanceAggregationAverage = initServiceData()

    organizationIds.forEach(id => {
      attendanceXAxis.push(
        organizations.filter(org => org.id === id).map(org => org.name)
      )

      const serviceMap = initServiceData()
      attendanceData.filter(
        att => att.organization_id = id
      ).map(
        att => {
          if (att.name === '주일2부예배' || att.name === '주일3부예배')
            serviceMap.sunday = att.count
          else if (att.name === '청년예배')
            serviceMap.sundayYoungAdult = att.count
          else if (att.name === '수요청년예배')
            serviceMap.wednesdayYoungAdult = att.count
          else if (att.name === '금요청년예배')
            serviceMap.fridayYoungAdult = att.count
        }
      )

      attendanceCounts.push(serviceMap)
    })

    attendanceData.forEach((att) => {
      if (att.name === '주일2부예배' || att.name === '주일3부예배')
        attendanceAggregationSum.sunday += att.count
      else if (att.name === '청년예배')
        attendanceAggregationSum.sundayYoungAdult += att.count
      else if (att.name === '수요청년예배')
        attendanceAggregationSum.wednesdayYoungAdult += att.count
      else if (att.name === '금요청년예배')
        attendanceAggregationSum.fridayYoungAdult += att.count
    })

    const orgCount = organizationIds.length
    attendanceAggregationAverage.sunday = Math.floor(attendanceAggregationSum.sunday / orgCount)
    attendanceAggregationAverage.sundayYoungAdult = Math.floor(attendanceAggregationSum.sundayYoungAdult / orgCount)
    attendanceAggregationAverage.wednesdayYoungAdult = Math.floor(attendanceAggregationSum.wednesdayYoungAdult / orgCount)
    attendanceAggregationAverage.fridayYoungAdult = Math.floor(attendanceAggregationSum.fridayYoungAdult / orgCount)

    return {
      attendanceXAxis,
      attendanceYAxisMax,
      attendanceCounts,
      attendanceAggregationSum,
      attendanceAggregationAverage
    }
  }
}

export default attendanceService;