import models from "../../models/models.js"
import { ValidationError } from "../../utils/errors"
import { getOrganizationNamePattern } from "../../utils/organization.js"
import { getCurrentSeasonId } from "../../utils/season"

const WORSHIP_TYPE = [
  "주일2부예배", "주일3부예배", "청년예배", "수요예배", "수요청년예배", "금요예배", "금요청년예배"
]
const SEASON_ID = getCurrentSeasonId()

const attendanceAggregationService = {
  aggregate: async (query) => {
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
    const organizationData = await models.Organization.findOne({
      where: {
        season_id: SEASON_ID,
        organization_name: {
          [models.Sequelize.Op.like]: organizationNamePattern
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
                  [models.Sequelize.Op.between]: [startDate, endDate]
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

    console.log(organizationData)    
  }
}

export default attendanceAggregationService
