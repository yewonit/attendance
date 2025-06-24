import { ValidationError } from "../../utils/errors"

const WORSHIP_TYPE = [
  "SUNDAY2", "SUNDAY3", "SUNDAY_YOUNGADULT", "WEDNESDAY", "WEDNESDAY_YOUNGADULT", "FRIDAY", "FRIDAY_YOUNGADULT"
]

const attendanceAggregationService = {
  aggregate: async (query) => {
    const startDate = query.startDate
    const endDate = query.endDate
    const gook = query.gook
    const group = query.group
    const soon = query.soon
    const worship = query.worship

    if (!WORSHIP_TYPE.includes(worship)) {
      throw new ValidationError("예배의 입력값이 올바르지 않습니다.")
    }
    
    
  }
}

export default attendanceAggregationService
