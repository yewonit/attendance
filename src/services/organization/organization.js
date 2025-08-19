// Organization.Ctrl.js

import models from "../../models/models.js";
import { NotFoundError } from "../../utils/errors.js";
import crudService from "../common/crud.js";

// 📝 조직 정보 유효성 검사 함수
const validateOrganizationData = async (data) => {
	if (!data.organization_name) {
		const error = new Error("조직 이름이 누락되었습니다.");
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
				as: "user",
				required: true,
				attributes: ["id", "name", "email"],
				where: { is_deleted: false },
			},
			{
				model: models.Role,
				as: "role",
				required: true,
				attributes: ["id", "name"],
			},
		],
	});

	return organizationMembers.map((member) => ({
		id: member.user.id,
		name: member.user.name,
		email: member.user.email,
		roleName: member.role.name,
	}));
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
					as: "activities",
					attributes: ["id", "name"],
					where: { is_deleted: false },
					required: false,
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
									where: { is_deleted: false },
									attributes: ["id", "name", "email"],
								},
							],
						},
						{
							model: models.ActivityImage,
							as: "images",
							required: false,
							attributes: ["id", "name", "path"],
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

		// TODO: 추후 프론트에서 리뉴얼된 테이블 데이터에 맞춰 사용하도록 수정 필요
		const activitiesData = organization.activities.map((activity) => {
			return {
				id: 1,
				name: activity.name,
				description: activity.description,
				category: activity.category,
				instances: {
					id: activity.id,
					activity_id: 1,
					parent_instance_id: null,
					start_datetime: activity.start_time,
					end_datetime: activity.end_time,
					notes: activity.description,
					is_canceled: activity.is_deleted,
					created_at: activity.created_at,
					updated_at: activity.updated_at,
					attendances: activity.attendances.map((attendance) => {
						return {
							userId: attendance.user.id,
							userName: attendance.user.name,
							userEmail: attendance.user.email,
							userPhoneNumber: attendance.user.phone_number,
							status: attendance.attendance_status,
							check_in_time: activity.start_time,
							check_out_time: activity.end_time,
							note: null,
						};
					}),
					images: activity.images.map((image) => ({
						id: image.id,
						fileName: image.name,
						filePath: image.path,
						fileType: "jpeg",
						fileSize: 100,
					})),
				},
			};
		});

		return {
			organizationId: organization.id,
			organizationName: organization.name,
			activities: activitiesData,
		};
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
