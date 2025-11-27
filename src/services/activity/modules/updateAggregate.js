import models from "../../../models/models.js";

/**
 * user_attendance_aggregate 업데이트 헬퍼 함수
 * 출석/결석 기록에 따라 집계 데이터를 업데이트합니다.
 * 
 * @param {number} userId - 사용자 ID
 * @param {string} activityType - 활동 유형
 * @param {string} attendanceStatus - 출석 상태 ('출석' 또는 '결석')
 * @param {Object} transaction - Sequelize 트랜잭션 객체
 */
const updateUserAttendanceAggregate = async (userId, activityType, attendanceStatus, transaction) => {
	// user_attendance_aggregate 찾기 또는 생성
	let aggregate = await models.UserAttendanceAggregate.findOne({
		where: {
			user_id: userId,
			activity_type: activityType,
		},
		transaction,
	});

  if (!aggregate) {
    const userAttendances = await models.Attendance.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: models.Activity,
          as: "activity",
          where: {
            name: activityType,
          },
        },
      ],
      transaction,
    });

    const totalAttendCount = userAttendances.filter(attendance => attendance.attendance_status === '출석').length;
    const totalAbsenceCount = userAttendances.filter(attendance => attendance.attendance_status === '결석').length;

    aggregate = await models.UserAttendanceAggregate.create(
      {
        user_id: userId,
        activity_type: activityType,
        attendance_continuous_count: 0,
        absence_continuous_count: 0,
        total_attend_count: totalAttendCount,
        total_absence_count: totalAbsenceCount,
        last_action: null,
        last_opposite_continuous_count: 0,
        is_disabled: false,
      }, 
      { transaction }
    );
  }

	// 출석 상태에 따라 업데이트
	if (attendanceStatus === '출석') {
		await aggregate.update(
			{
				attendance_continuous_count: aggregate.attendance_continuous_count + 1,
				total_attend_count: aggregate.total_attend_count + 1,
				absence_continuous_count: 0,
        last_action: attendanceStatus,
        last_opposite_continuous_count: aggregate.absence_continuous_count
			},
			{ transaction }
		);
	} else if (attendanceStatus === '결석') {
		await aggregate.update(
			{
				absence_continuous_count: aggregate.absence_continuous_count + 1,
				total_absence_count: aggregate.total_absence_count + 1,
				attendance_continuous_count: 0,
        last_action: attendanceStatus,
        last_opposite_continuous_count: aggregate.attendance_continuous_count
			},
			{ transaction }
		);
	}
};

const updateUserAttendanceAggregateWhenChanged = async (userId, activityType, attendanceStatus, transaction) => {
  const aggregate = await models.UserAttendanceAggregate.findOne({
		where: {
			user_id: userId,
			activity_type: activityType,
		},
		transaction,
	});

  if (!aggregate) {
    return;
  }

  if (attendanceStatus === aggregate.last_action) {
    return;
  }

  if (aggregate.last_action === '출석') {
    await aggregate.update(
      {
        attendance_continuous_count: 0,
        absence_continuous_count: aggregate.last_opposite_continuous_count + 1,
        total_attend_count: aggregate.total_attend_count - 1,
        total_absence_count: aggregate.total_absence_count + 1,
        last_action: attendanceStatus,
        last_opposite_continuous_count: aggregate.attendance_continuous_count - 1
      },
      { transaction }
    );
  }
  else if (aggregate.last_action === '결석') {
    await aggregate.update(
      {
        attendance_continuous_count: aggregate.last_opposite_continuous_count + 1,
        absence_continuous_count: 0,
        total_attend_count: aggregate.total_attend_count + 1,
        total_absence_count: aggregate.total_absence_count - 1,
        last_action: attendanceStatus,
        last_opposite_continuous_count: aggregate.absence_continuous_count - 1
      },
      { transaction }
    );
  }
}

export { updateUserAttendanceAggregate, updateUserAttendanceAggregateWhenChanged };
