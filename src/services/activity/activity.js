import { activityTemplate } from "../../enums/activity_template.js";
import { Op } from "sequelize";
import models from "../../models/models.js";
import { sequelize } from "../../utils/database.js";
import { DataCreationError, ValidationError, NotFoundError } from "../../utils/errors.js";

// TODO: organization의 활동 관련 서비스 구현
const activityService = {
	getActivityTemplate: () => {
		const result = [];
		for (let template of Object.values(activityTemplate)) {
			result.push(template);
		}
		return result;
	},
	getAllOrganizationActivities: async (organizationId) => {
		const activities = await models.Activity.findAll({
			where: { organization_id: organizationId },
			include: [
				{
					model: models.Attendance,
					as: "attendances",
					required: false,
					include: [
						{
							model: models.User,
							as: "user",
							required: true,
							attributes: ["id", "name", "email"],
							where: { is_deleted: false },
						},
					],
				},
				{
					model: models.ActivityImage,
					as: "images",
					required: false,
				},
			],
		});

		if (!activities || activities.length === 0) {
			return null;
		}

		const result = activities.map((activity) => {
			return {
				id: activity.id,
				activityCategory: activity.activity_category,
				location: activity.location,
				startDateTime: activity.start_time,
				endDateTime: activity.end_time,
				notes: activity.description,
				name: activity.name,
				description: activity.description,
				createdAt: activity.created_at,
				attendances: activity.attendances.map((attendance) => ({
					id: attendance.id,
					userId: attendance.user.id,
					userName: attendance.user.name,
					userEmail: attendance.user.email,
					status: attendance.attendance_status,
					note: attendance.description,
				})),
				images: activity.images.map((image) => ({
					id: image.id,
					name: image.name,
					path: image.path,
				})),
			};
		});

		return result;
	},
	getActivityDetails: async (activityId) => {
		const activity = await models.Activity.findOne({
			where: { id: activityId },
			include: [
				{
					model: models.Attendance,
					as: "attendances",
					required: false,
					include: [
						{
							model: models.User,
							as: "user",
							required: true,
							attributes: ["id", "name", "email"],
							where: { is_deleted: false },
						},
					],
				},
				{
					model: models.ActivityImage,
					as: "images",
					required: false,
				},
			],
		});

		if (!activity) {
			return null;
		}

		return {
			id: activity.id,
			activityCategory: activity.activity_category,
			location: activity.location,
			startDateTime: activity.start_time,
			endDateTime: activity.end_time,
			notes: activity.description,
			name: activity.name,
			description: activity.description,
			attendances: activity.attendances.map((attendance) => ({
				id: attendance.id,
				userId: attendance.user.id,
				userName: attendance.user.name,
				userEmail: attendance.user.email,
				status: attendance.attendance_status,
				note: attendance.description,
			})),
			images: activity.images.map((image) => ({
				id: image.id,
				name: image.name,
				path: image.path,
			})),
		};
	},
	recordActivityAndAttendance: async (
		organizationId,
		activityTemplateId,
		data
	) => {
		const { activityData, attendances, imageInfo } = data;

		if (!activityTemplateId || !activityData || !attendances) {
			throw new ValidationError(
				`필수 데이터가 누락되었습니다. activityId: ${activityTemplateId}, activityData: ${activityData}, attendances: ${attendances}`
			);
		}

		if (!activityData.startDateTime || !activityData.endDateTime) {
			throw new ValidationError("시작 시간과 종료 시간은 필수입니다.");
		}

		const organization = await models.Organization.findByPk(organizationId);
		if (!organization) {
			throw new ValidationError("조직을 찾을 수 없습니다.");
		}

		const templateId = Number(activityTemplateId);
		if (Number.isNaN(templateId)) {
			throw new ValidationError("유효하지 않은 활동 템플릿 ID입니다.");
		}

		const template = Object.values(activityTemplate).find(
			(at) => at.id === templateId
		);

		if (!template) {
			throw new ValidationError("해당 활동 템플릿을 찾을 수 없습니다.");
		}

		try {
			const activity = await models.Activity.create({
				name: template.name || activityData.name,
				description: activityData.notes,
				activity_category: template.activityCategory || activityData.activityCategory,
				location: activityData.location,
				organization_id: organizationId,
				start_time: activityData.startDateTime,
				end_time: activityData.endDateTime,
			});

			if (imageInfo) {
				await models.ActivityImage.create({
					activity_id: activity.id,
					name: imageInfo.fileName,
					path: imageInfo.url,
				});
			}

			attendances.map((attendance) => {
				models.Attendance.create({
					activity_id: activity.id,
					user_id: attendance.userId,
					attendance_status: attendance.status,
					description: attendance.note,
				});
			});
		} catch (error) {
			throw new DataCreationError("활동 정보 저장 중 에러 발생 : ", error);
		}
	},

	/**
	 * 활동 및 출석 정보를 업데이트합니다.
	 * @param {number} activityId - 활동 ID
	 * @param {Object} data - 업데이트할 데이터 객체
	 * @returns {Promise<void>}
	 */
	updateActivityAndAttendance: async (activityId, data) => {
		const { activityData, attendances, imageInfo } = data;

		if (!activityId || !activityData || !attendances) {
			throw new ValidationError("필수 데이터가 누락되었습니다.");
		}

		const activity = await models.Activity.findOne({
			where: { id: activityId },
		});
		if (!activity) {
			throw new NotFoundError("활동을 찾을 수 없습니다.");
		}

		await activity.update({
			location: activityData.location,
			start_time: activityData.startDateTime,
			end_time: activityData.endDateTime,
			description: activityData.notes,
		});

		if (imageInfo && imageInfo.url && imageInfo.fileName) {
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
	deleteActivityAndAttendance: async (activityId) => {
		await sequelize.transaction(async (t) => {
			const activity = await models.Activity.findByPk(activityId);
			if (activity) {
				await activity.destroy();
			}

			const activityImage = await models.ActivityImage.findOne({
				where: { activity_id: activityId },
			});
			if (activityImage) {
				await activityImage.destroy();
			}

			const attendances = await models.Attendance.findAll({
				where: {
					activity_id: activityId,
				},
			});
			attendances.forEach(async (attendance) => {
				await attendance.destroy();
			});
		});
	},
	/**
	 * 최근 1주 이내 청년예배 활동 ID 목록을 조회합니다.
	 * @param {number[]} organizationIds - 조직 ID 배열
	 * @returns {Promise<number[]>} 활동 ID 배열
	 */
	getLastSundayYoungAdultServiceIds: async (organizationIds) => {
		const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const activities = await models.Activity.findAll({
			attributes: ['id'],
			where: {
				start_time: { [Op.gt]: oneWeekAgo },
				name: '청년예배',
				organization_id: { [Op.in]: organizationIds }
			},
		});

		return activities.map((activity) => activity.id);
	},
	/**
	 * 1~2주 전 사이 청년예배 활동 ID 목록을 조회합니다.
	 * @param {number[]} organizationIds - 조직 ID 배열
	 * @returns {Promise<number[]>} 활동 ID 배열
	 */
	get2WeeksAgoSundayYoungAdultServiceIds: async (organizationIds) => {
		const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		const twoWeekAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
		const activities = await models.Activity.findAll({
			attributes: ['id'],
			where: {
				start_time: { [Op.lt]: oneWeekAgo, [Op.gt]: twoWeekAgo },
				name: '청년예배',
				organization_id: { [Op.in]: organizationIds }
			},
		});

		return activities.map((activity) => activity.id);
	}
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
