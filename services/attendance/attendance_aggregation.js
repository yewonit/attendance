import { Op } from "sequelize"
import models from "../../models/models.js"
import { ValidationError } from "../../utils/errors.js"
import { getOrganizationNamePattern } from "../../utils/organization.js"
import { getCurrentSeasonId } from "../../utils/season.js"

const WORSHIP_TYPE = [
  "주일2부예배", "주일3부예배", "청년예배", "수요예배", "수요청년예배", "금요예배", "금요청년예배"
]
const SEASON_ID = getCurrentSeasonId()

const attendanceAggregationService = {
  aggregateGraph: async (query) => {
    const organizationData = await getAttendanceData(query)

    const result = {
      "XAxisTitles": [],
      "XAxisRawData": [],
      "XAxisSumData": [],
      "XAxisAvgData": [],
      "YAxisMaximum": undefined,
      "YAxisMinimum": 0,
    }

    for (let org of organizationData) {
      let dateFormat = ""
      const orgAttendance = []
      for (let act of org.Activities) {
        for (let act_inst of act.ActivityInstances) {
          const date = new Date(act_inst.start_datetime)
          dateFormat = `${date.getMonth() + 1}/${date.getDate()}`
          if (!result.XAxisTitles.includes(dateFormat)) {
            result.XAxisTitles.push(dateFormat)
          }

          const attendanceCount = act_inst.Attendances.filter((attendance) => attendance.AttendanceStatus.id === 1).length
          if (attendanceCount > result.YAxisMaximum) {
            result.YAxisMaximum = attendanceCount
          }
          const attendData = {
            "orgId": org.id,
            "orgName": org.organization_name,
            "date": dateFormat,
            "attendanceCount": attendanceCount
          }
          orgAttendance.push(attendData)
        }
      }
      result.XAxisRawData.push(orgAttendance)
      let sum = 0
      let avg = 0
      orgAttendance.forEach(attendData => {
        sum += attendData.attendanceCount
      })
      avg = sum / orgAttendance.length
      const sumData = {
        "orgId": org.id,
        "orgName": org.organization_name,
        "date": dateFormat,
        "sumData": sum,
      }
      const avgData = {
        "orgId": org.id,
        "orgName": org.organization_name,
        "date": dateFormat,
        "avgData": avg,
      }
      result.XAxisSumData.push(sumData)
      result.XAxisAvgData.push(avgData)


    }
    result.YAxisMaximum = (Math.floor(result.YAxisMaximum / 100) + 1) * 100

    return result
  },
  aggregateWeekStatus: async (query) => {
    query.endDate = new Date()
    query.startDate = new Date().setDate(query.endDate - 7)

  }
}

const getAttendanceData = async (query) => {
  const startDate = query.startDate
  const endDate = query.endDate
  const gook = query.gook
  const group = query.group
  const soon = query.soon
  let worship = query.worship

  if (!WORSHIP_TYPE.includes(worship)) {
    throw new ValidationError("예배의 입력값이 올바르지 않습니다.")
  }

  if (worship == "수요청년예배")
    worship = "수요제자기도회"
  if (worship == "금요청년예배")
    worship = "현장치유팀사역"

  const organizationNamePattern = getOrganizationNamePattern(gook, group, soon)

  // organization_id로 모든 관련 데이터를 한 번에 가져오는 쿼리
  const organizationData = await models.Organization.findAll({
    where: {
      season_id: SEASON_ID,
      organization_name: {
        [Op.like]: organizationNamePattern
      }
    },
    include: [
      {
        model: models.Activity,
        where: {
          name: worship
        },
        include: [
          {
            model: models.ActivityInstance,
            where: startDate && endDate ? {
              start_datetime: {
                [Op.between]: [startDate, endDate]
              }
            } : {},
            include: [
              {
                model: models.Attendance,
                include: [
                  {
                    model: models.User,
                    attributes: ['id', 'name', 'name_suffix', 'birth_date', 'is_new_member', 'is_deleted']
                  },
                  {
                    model: models.AttendanceStatus,
                    attributes: ['id', 'name']
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  })

  return organizationData
}

export default attendanceAggregationService
