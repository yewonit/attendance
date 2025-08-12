// Organization.Ctrl.js

import models from "../../models/models.js";
import crudService from "../common/crud.js";
import { NotFoundError } from "../../utils/errors.js";
import { Op } from "sequelize";

// 📝 조직 정보 유효성 검사 함수
const validateOrganizationData = async (data) => {
	if (!data.organization_name) {
		const error = new Error("조직 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.organization_code) {
		const error = new Error("조직 코드가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// ✅ 추가 유효성 검사 로직
	// 추가적인 유효성 검사 로직을 구현할 수 있습니다.
};

const getMembersById = async (organizationId) => {
	const organizationMembers = await models.UserRole.findAll({
		where: {
			organization_id: organizationId,
		},
		include: [
			{
				model: models.User,
				attributes: ["id", "name", "email"],
				where: { is_deleted: false },
			},
			{
				model: models.Role,
				attributes: ["id", "name"],
			},
		],
	});

	return organizationMembers;
};

// 📦 조직 관련 컨트롤러 모듈
const organizationService = {
	// ✨ 조직 생성
	createOrganization: crudService.create(
		models.Organization,
		validateOrganizationData
	),

	// 📖 전체 조직 조회
	findOrganizations: crudService.findAll(models.Organization),

	// 🔍 특정 조직 조회
	findOrganization: crudService.findOne(models.Organization),

	// ✏️ 조직 정보 업데이트
	updateOrganization: crudService.update(
		models.Organization,
		validateOrganizationData
	),

	// 🗑️ 조직 삭제
	deleteOrganization: crudService.delete(models.Organization),

	// 조직 멤버 목록 조회
	getOrganizationMembers: async (organizationId) =>
		await getMembersById(organizationId),

	getOrganizationActivities: async (organizationId) => {
		if (!organizationId) {
			throw new Error("조직 ID가 제공되지 않았습니다.");
		}

		const organization = await models.Organization.findByPk(organizationId, {
			include: [
				{
					model: models.Activity,
					include: [
						models.ActivityCategory,
						{
							model: models.ActivityInstance,
							include: [
								{
									model: models.Attendance,
									include: [
										{
											model: models.User,
											attributes: ["id", "name", "email", "phone_number"],
										},
										models.AttendanceStatus,
									],
								},
								// 이미지 파일 정보를 포함
								{
									model: models.File,
									as: "Images",
									attributes: [
										"id",
										"file_name",
										"file_path",
										"file_type",
										"file_size",
									],
								},
							],
						},
					],
				},
			],
		});

		if (!organization) {
			throw new NotFoundError(
				`ID ${organizationId}에 해당하는 조직을 찾을 수 없습니다.`
			);
		}

		const activitiesData = organization.Activities.map((activity) => {
			return {
				id: activity.id,
				name: activity.name,
				description: activity.description,
				category: activity.ActivityCategory
					? activity.ActivityCategory.name
					: null,
				instances: activity.ActivityInstances.map((instance) => {
					return {
						id: instance.id,
						activity_id: instance.activity_id,
						parent_instance_id: instance.parent_instance_id,
						start_datetime: instance.start_datetime,
						end_datetime: instance.end_datetime,
						actual_location: instance.actual_location,
						actual_online_link: instance.actual_online_link,
						notes: instance.notes,
						attendance_count: instance.attendance_count,
						is_canceled: instance.is_canceled,
						created_at: instance.created_at,
						updated_at: instance.updated_at,
						creator_id: instance.creator_id,
						updater_id: instance.updater_id,
						attendances: instance.Attendances.map((attendance) => {
							return {
								userId: attendance.User.id,
								userName: attendance.User.name,
								userEmail: attendance.User.email,
								userPhoneNumber: attendance.User.phone_number,
								status: attendance.AttendanceStatus
									? attendance.AttendanceStatus.name
									: null,
								check_in_time: attendance.check_in_time,
								check_out_time: attendance.check_out_time,
								note: attendance.note,
							};
						}),
						images: instance.Images.map((image) => ({
							id: image.id,
							fileName: image.file_name,
							filePath: image.file_path,
							fileType: image.file_type,
							fileSize: image.file_size,
						})),
					};
				}),
			};
		});

		return {
			organizationId: organization.id,
			organizationName: organization.organization_name,
			activities: activitiesData,
		};
	},
	getCurrentSeasonCoramdeoOrg: async (seasonId) => {
		const coramdeo = await models.Organization.findOne({
			where: {
				season_id: seasonId,
				organization_code: "CORAMDEO",
			},
		});

		return coramdeo;
	},
	getUnderOrganizationById: async (parentId) => {
		const orgs = await models.Organization.findAll({
			where: {
				upper_organization_id: parentId,
			},
		});

		return orgs;
	},
};

export default organizationService;
