import { Op } from "sequelize";
import { activityTemplate } from "../../enums/activity_template.js";
import models from "../../models/models.js";
import { sequelize } from "../../utils/database.js";
import {
	DataCreationError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";

// TODO: organization의 활동 관련 서비스 구현
const activityService = {
	getActivityTemplate: () => {
		const result = [];
		for (let template of Object.values(activityTemplate)) {
			result.push(template);
		}
		return result;
	},
	/**
	 * 📊 조직 활동 목록 조회 서비스 (성능 최적화 버전)
	 * - 쿼리를 분리하여 Cartesian Product 문제 해결
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 * - 필요한 attributes만 선택하여 네트워크 전송량 감소
	 *
	 * @param {number} organizationId - 조직 ID
	 * @returns {Array|null} 활동 목록 또는 null
	 *
	 * TODO: 페이지네이션 추가 고려
	 */
	getAllOrganizationActivities: async (organizationId) => {
		// 1️⃣ 활동 목록 조회
		const activities = await models.Activity.findAll({
			where: { organization_id: organizationId },
			attributes: [
				"id",
				"activity_category",
				"location",
				"start_time",
				"end_time",
				"description",
				"name",
				"created_at",
			],
			order: [["start_time", "DESC"]],
		});

		if (!activities || activities.length === 0) {
			return null;
		}

		const activityIds = activities.map((a) => a.id);

		// 2️⃣ 출석 정보 일괄 조회
		const attendances = await models.Attendance.findAll({
			where: { activity_id: activityIds },
			attributes: [
				"id",
				"activity_id",
				"user_id",
				"attendance_status",
				"description",
			],
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					attributes: ["id", "name", "email"],
					where: { is_deleted: false },
				},
			],
		});

		// 3️⃣ 이미지 정보 일괄 조회
		const images = await models.ActivityImage.findAll({
			where: { activity_id: activityIds },
			attributes: ["id", "activity_id", "name", "path"],
		});

		// 4️⃣ 데이터 매핑을 위한 Map 생성
		const attendancesByActivityId = attendances.reduce((map, att) => {
			if (!map[att.activity_id]) map[att.activity_id] = [];
			map[att.activity_id].push(att);
			return map;
		}, {});

		const imagesByActivityId = images.reduce((map, img) => {
			if (!map[img.activity_id]) map[img.activity_id] = [];
			map[img.activity_id].push(img);
			return map;
		}, {});

		// 5️⃣ 최종 데이터 조합
		const result = activities.map((activity) => {
			const activityAttendances = attendancesByActivityId[activity.id] || [];
			const activityImages = imagesByActivityId[activity.id] || [];

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
				attendances: activityAttendances.map((attendance) => ({
					id: attendance.id,
					userId: attendance.user.id,
					userName: attendance.user.name,
					userEmail: attendance.user.email,
					status: attendance.attendance_status,
					note: attendance.description,
				})),
				images: activityImages.map((image) => ({
					id: image.id,
					name: image.name,
					path: image.path,
				})),
			};
		});

		return result;
	},
	/**
	 * 📋 특정 활동 상세 정보 조회 (성능 최적화 버전)
	 * - 쿼리를 분리하여 Cartesian Product 문제 해결
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 *
	 * @param {number} activityId - 활동 ID
	 * @returns {Object|null} 활동 상세 정보 또는 null
	 */
	getActivityDetails: async (activityId) => {
		// 1️⃣ 활동 기본 정보 조회
		const activity = await models.Activity.findOne({
			where: { id: activityId },
			attributes: [
				"id",
				"activity_category",
				"location",
				"start_time",
				"end_time",
				"description",
				"name",
			],
		});

		if (!activity) {
			return null;
		}

		// 2️⃣ 출석 정보 조회
		const attendances = await models.Attendance.findAll({
			where: { activity_id: activityId },
			attributes: ["id", "user_id", "attendance_status", "description"],
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					attributes: ["id", "name", "email"],
					where: { is_deleted: false },
				},
			],
		});

		// 3️⃣ 이미지 정보 조회
		const images = await models.ActivityImage.findAll({
			where: { activity_id: activityId },
			attributes: ["id", "name", "path"],
		});

		// 4️⃣ 최종 데이터 조합
		return {
			id: activity.id,
			activityCategory: activity.activity_category,
			location: activity.location,
			startDateTime: activity.start_time,
			endDateTime: activity.end_time,
			notes: activity.description,
			name: activity.name,
			description: activity.description,
			attendances: attendances.map((attendance) => ({
				id: attendance.id,
				userId: attendance.user.id,
				userName: attendance.user.name,
				userEmail: attendance.user.email,
				status: attendance.attendance_status,
				note: attendance.description,
			})),
			images: images.map((image) => ({
				id: image.id,
				name: image.name,
				path: image.path,
			})),
		};
	},
	/**
	 * 활동과 출석 동시 생성 서비스
	 * @description 활동(Activity), 이미지(ActivityImage), 출석(Attendance) 생성을 하나의 트랜잭션으로 묶습니다.
	 * TODO: 참석자 대량 삽입 시 bulkCreate로 최적화 및 성능 테스트
	 */
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
			await sequelize.transaction(async (t) => {
				const activity = await models.Activity.create(
					{
						name: template.name || activityData.name,
						description: activityData.notes,
						activity_category:
							template.activityCategory || activityData.activityCategory,
						location: activityData.location,
						organization_id: organizationId,
						start_time: activityData.startDateTime,
						end_time: activityData.endDateTime,
					},
					{ transaction: t }
				);

				if (imageInfo) {
					await models.ActivityImage.create(
						{
							activity_id: activity.id,
							name: imageInfo.fileName,
							path: imageInfo.url,
						},
						{ transaction: t }
					);
				}

				await Promise.all(
					attendances.map((attendance) => {
						return models.Attendance.create(
							{
								activity_id: activity.id,
								user_id: attendance.userId,
								attendance_status: attendance.status,
								description: attendance.note,
							},
							{ transaction: t }
						);
					})
				);
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
	/**
	 * 활동과 출석 동시 업데이트 서비스
	 * @description 활동(Activity), 이미지(ActivityImage), 출석(Attendance) 변경을 하나의 트랜잭션으로 묶습니다.
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

		await sequelize.transaction(async (t) => {
			await activity.update(
				{
					location: activityData.location,
					start_time: activityData.startDateTime,
					end_time: activityData.endDateTime,
					description: activityData.notes,
				},
				{ transaction: t }
			);

			if (imageInfo && imageInfo.url && imageInfo.fileName) {
				const existingFile = await models.ActivityImage.findOne({
					where: { activity_id: activityId },
				});

				await existingFile.update(
					{
						name: imageInfo.fileName,
						path: imageInfo.url,
					},
					{ transaction: t }
				);
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
							transaction: t,
						});

					if (!created) {
						await attendanceRecord.update(
							{
								attendance_status: attendance.status,
								description: attendance.note || null,
							},
							{ transaction: t }
						);
					}
				})
			);
		});
	},
	/**
	 * 활동과 출석 동시 삭제 서비스
	 * @description 활동(Activity), 이미지(ActivityImage), 출석(Attendance) 삭제를 하나의 트랜잭션으로 묶습니다.
	 */
	deleteActivityAndAttendance: async (activityId) => {
		await sequelize.transaction(async (t) => {
			const activity = await models.Activity.findByPk(activityId);
			if (activity) {
				await activity.destroy({ transaction: t });
			}

			const activityImage = await models.ActivityImage.findOne({
				where: { activity_id: activityId },
			});
			if (activityImage) {
				await activityImage.destroy({ transaction: t });
			}

			const attendances = await models.Attendance.findAll({
				where: {
					activity_id: activityId,
				},
			});
			await Promise.all(
				attendances.map((attendance) => attendance.destroy({ transaction: t }))
			);
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
			attributes: ["id"],
			where: {
				start_time: { [Op.gt]: oneWeekAgo },
				name: "청년예배",
				organization_id: { [Op.in]: organizationIds },
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
			attributes: ["id"],
			where: {
				start_time: { [Op.lt]: oneWeekAgo, [Op.gt]: twoWeekAgo },
				name: "청년예배",
				organization_id: { [Op.in]: organizationIds },
			},
		});

		return activities.map((activity) => activity.id);
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
