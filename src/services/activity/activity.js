import { activityTemplate } from "../../enums/activity_template.js";
import { DataCreationError, ValidationError } from "../../utils/errors.js";

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
	recordActivityAndAttendance: async (organizationId, activityTemplateId, data) => {
		const { activityData, attendances, imageInfo } = data;

		if (!activityTemplateId || !activityData || !attendances) {
			throw new ValidationError(`필수 데이터가 누락되었습니다. activityId: ${activityId}, activityData: ${activityData}, attendances: ${attendances}`)
		}

		if (!activityData.startDateTime || !activityData.endDateTime) {
			throw new ValidationError("시작 시간과 종료 시간은 필수입니다.")
		}

		const organization = await models.Organization.findByPk(organizationId);
		if (!organization) {
			throw new ValidationError("조직을 찾을 수 없습니다.")
		}

		const template = Object.values(activityTemplate).find(
			(at) => at.id === activityId
		);
		if (!template) {
			throw new ValidationError("해당 활동 템플릿을 찾을 수 없습니다.")
		}

		if (!(imageInfo &&
			typeof imageInfo === "object" &&
			imageInfo.url &&
			imageInfo.fileName &&
			imageInfo.fileType)
		) {
			throw new ValidationError("올바르지 않은 imageInfo : ", imageInfo)
		}

		try {
			const activity = await models.Activity.create({
				name: template.name,
				description: activityData.notes,
				activity_category: template.activityCategory,
				location: activityData.location,
				organization_id: organizationId,
				start_time: activityData.startDateTime,
				end_time: activityData.endDateTime,
			});

			await models.ActivityImage.create({
				activity_id: activity.id,
				name: imageInfo.fileName,
				path: imageInfo.url,
			});

			attendances.map((attendance) => {
				models.Attendance.create({
					activity_id: activity.id,
					user_id: attendance.userId,
					attendance_status: attendance.status,
					description: attendance.note,
				});
			})

		} catch (error) {
			throw new DataCreationError("활동 정보 저장 중 에러 발생 : ", error)
		}
	},

	updateActivityAndAttendance: async (activityId, data) => {
		const { activityData, attendances, imageInfo } = data;

		if (!activityId || !activityData || !attendances) {
			throw new ValidationError("필수 데이터가 누락되었습니다.")
		}

		const activity = await models.Activity.findOne({
			where: { id: activityId },
		});
		if (!activity) {
			return res
				.status(404)
				.json({ message: "활동을 찾을 수 없습니다." });
		}

		await activity.update({
			location: activityData.location,
			start_time: activityData.startDateTime,
			end_time: activityData.endDateTime,
			description: activityData.notes,
		});

		if (
			imageInfo &&
			imageInfo.url &&
			imageInfo.fileName
		) {
			const existingFile = await models.ActivityImage.findOne({
				where: { activity_id: activityId },
			});

			existingFile.update({
				name: imageInfo.fileName,
				path: imageInfo.url,
			});
		}

		await Promise.all(
			attendances.map(async (attendance) => {
				const [attendanceRecord, created] =
					await models.Attendance.findOrCreate({
						where: {
							activity_id: activityId,
							user_id: attendance.userId,
						},
						defaults: {
							attendance_status: attendance.status,
							description: attendance.note || null,
						},
					});

				if (!created) {
					await attendanceRecord.update({
						attendance_status: attendance.status,
						description: attendance.note || null,
					});
				}
			})
		);
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
