import { activityTemplate } from "../../enums/activity_template.js";

// TODO: organization의 활동 관련 서비스 구현
const activityService = {
	getActivityTemplate: () => {
		const result = []
		for (let template of Object.values(activityTemplate)) {
			result.push(template)
		}
	},
	// 활동 상세 정보 조회
	getActivityDetails: async (activityId) => {
		const activity = await models.Activity.findOne({
			where: { id: activityId },
			include: [
				{
					model: models.Attendance,
					include: [
						{
							model: models.User,
							where: { id: models.Attendance.user_id },
							attributes: ["id", "name", "email"],
						},
					],
				},
				{
					model: models.ActivityImage,
					where: { activity_id: activityId },
				},
			],
		});

		if (!activity) {
			return null
		}

		return {
			activity: {
				id: activity.id,
				startDateTime: activity.start_time,
				endDateTime: activity.end_time,
				notes: activity.description,
				name: activity.name,
				description: activity.description,
				attendances: activity.Attendances.map((attendance) => ({
					id: attendance.id,
					userId: attendance.User.id,
					userName: attendance.User.name,
					userEmail: attendance.User.email,
					status: attendance.attendance_status,
					note: attendance.description,
				})),
				images: activity.ActivityImages.map((image) => ({
					id: image.id,
					name: image.name,
					path: image.path,
				})),
			},
		};
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
