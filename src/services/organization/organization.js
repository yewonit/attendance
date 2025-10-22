// Organization.Ctrl.js

import { Op } from "sequelize";
import models from "../../models/models.js";
import { NotFoundError } from "../../utils/errors.js";
import { getOrganizationNamePattern } from "../../utils/organization.js";
import { getCurrentSeasonId } from "../../utils/season.js";
import crudService from "../common/crud.js";
import { sequelize } from "../../utils/database.js";

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

const getMembersByIdWithRoles = async (organizationId) => {
	const userRoles = await models.UserRole.findAll({
		where: { organization_id: organizationId },
		include: [
			{
				model: models.User,
				as: "user",
				required: true,
				where: { is_deleted: false },
				attributes: { exclude: ["password"] },
			},
			{
				model: models.Role,
				as: "role",
				required: true,
				where: { is_deleted: false },
			},
		],
	});

	// 필터링된 결과가 없는 경우 404 상태 코드와 메시지를 반환합니다.
	if (userRoles.length === 0) {
		return res
			.status(404)
			.json({ message: "해당 조직에 소속된 멤버가 없습니다." });
	}

	// 필터링된 결과를 JSON 배열로 변환합니다.
	const members = userRoles.map((userRole) => {
		const { user, role } = userRole;
		return {
			userId: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			churchRegistrationDate: user.registration_date,
			isNewMember: user.is_new_member,
			isLongTermAbsentee: user.is_long_term_absentee,
			roleId: role.id,
			roleName: role.name,
		};
	});

	return members;
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

	/**
	 * 👥 조직 멤버 목록 조회 (성능 최적화 버전)
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 *
	 * @param {number} organizationId - 조직 ID
	 * @returns {Array} 멤버 목록
	 */
	getOrganizationMembers: async (organizationId) => {
		return await getMembersById(organizationId);
	},

	/**
	 * 👥 조직 멤버와 역할 정보 조회 (성능 최적화 버전)
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 *
	 * @param {number} organizationId - 조직 ID
	 * @returns {Array} 멤버 및 역할 정보
	 */
	getMembersByIdWithRoles: async (organizationId) => {
		return await getMembersByIdWithRoles(organizationId);
	},

	/**
	 * 📊 조직의 활동 정보를 조회합니다 (성능 최적화 버전)
	 * - 쿼리를 분리하여 Cartesian Product 문제 해결
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 * - 필요한 attributes만 선택하여 네트워크 전송량 감소
	 *
	 * @param {number} organizationId - 조직 ID
	 * @returns {Object} 조직 정보와 활동 목록
	 * @throws {NotFoundError} 조직을 찾을 수 없는 경우
	 *
	 * TODO: 데이터가 계속 증가하면 페이지네이션 추가 고려 필요
	 * TODO: Redis 캐싱 전략 고려 (자주 조회되는 데이터라면)
	 */
	getOrganizationActivities: async (organizationId) => {
		if (!organizationId) {
			throw new Error("조직 ID가 제공되지 않았습니다.");
		}

		// 1️⃣ 조직 존재 여부 확인 (가벼운 쿼리)
		const organization = await models.Organization.findByPk(organizationId, {
			attributes: ["id", "name"],
		});

		if (!organization) {
			throw new NotFoundError(
				`ID ${organizationId}에 해당하는 조직을 찾을 수 없습니다.`
			);
		}

		// 2️⃣ 활동 목록 조회 (필요한 필드만)
		const activities = await models.Activity.findAll({
			where: {
				organization_id: organizationId,
				is_deleted: false,
			},
			attributes: [
				"id",
				"name",
				"description",
				"category",
				"start_time",
				"end_time",
				"created_at",
				"updated_at",
			],
			order: [["start_time", "DESC"]], // 최신순 정렬
		});

		// 활동이 없으면 빈 배열 반환
		if (activities.length === 0) {
			return {
				organizationId: organization.id,
				organizationName: organization.name,
				activities: [],
			};
		}

		const activityIds = activities.map((a) => a.id);

		// 3️⃣ 출석 정보 일괄 조회 (separate query로 N+1 방지)
		const attendances = await models.Attendance.findAll({
			where: {
				activity_id: activityIds,
			},
			attributes: [
				"id",
				"activity_id",
				"user_id",
				"attendance_status",
				"check_in_time",
				"check_out_time",
			],
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					where: { is_deleted: false },
					attributes: ["id", "name", "email", "phone_number"],
				},
			],
		});

		// 4️⃣ 이미지 정보 일괄 조회
		const images = await models.ActivityImage.findAll({
			where: {
				activity_id: activityIds,
			},
			attributes: ["id", "activity_id", "name", "path"],
		});

		// 5️⃣ 데이터 매핑을 위한 Map 생성 (O(1) lookup)
		const attendancesByActivityId = attendances.reduce((map, att) => {
			if (!map[att.activity_id]) {
				map[att.activity_id] = [];
			}
			map[att.activity_id].push(att);
			return map;
		}, {});

		const imagesByActivityId = images.reduce((map, img) => {
			if (!map[img.activity_id]) {
				map[img.activity_id] = [];
			}
			map[img.activity_id].push(img);
			return map;
		}, {});

		// 6️⃣ 최종 데이터 조합
		// TODO: 추후 프론트에서 리뉴얼된 테이블 데이터에 맞춰 사용하도록 수정 필요
		const activitiesData = activities.map((activity) => {
			const activityAttendances = attendancesByActivityId[activity.id] || [];
			const activityImages = imagesByActivityId[activity.id] || [];

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
					is_canceled: false, // is_deleted가 false인 것만 조회했으므로
					created_at: activity.created_at,
					updated_at: activity.updated_at,
					attendances: activityAttendances.map((attendance) => ({
						userId: attendance.user.id,
						userName: attendance.user.name,
						userEmail: attendance.user.email,
						userPhoneNumber: attendance.user.phone_number,
						status: attendance.attendance_status,
						check_in_time: attendance.check_in_time || activity.start_time,
						check_out_time: attendance.check_out_time || activity.end_time,
						note: null,
					})),
					images: activityImages.map((image) => ({
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
	getOrganizationIdsByGookAndGroup: async (gook, group, soon) => {
		const seasonId = getCurrentSeasonId();
		let name = getOrganizationNamePattern(gook, group, soon);
		if (name) {
			const result = await models.Organization.findAll({
				where: {
					season_id: seasonId,
					is_deleted: false,
					name: {
						[Op.like]: `${name}%`,
					},
				},
				attributes: ["id"],
			});

			return result;
		}
		const result = await models.Organization.findAll({
			where: {
				season_id: seasonId,
				is_deleted: false,
			},
			attributes: ["id"],
		});

		return result;
	},
	getOrganizationsByGookAndGroup: async (gook, group, soon) => {
		const seasonId = getCurrentSeasonId();
		let name = getOrganizationNamePattern(gook, group, soon);
		if (name) {
			return await models.Organization.findAll({
				where: {
					season_id: seasonId,
					is_deleted: false,
					name: {
						[Op.like]: `${name}%`,
					},
				},
			});
		}
		return await models.Organization.findAll({
			where: {
				season_id: seasonId,
				is_deleted: false,
			},
		});
	},
};

export default organizationService;
