import models from "../../models/models.js";
import { NotFoundError } from "../../utils/errors.js";

/**
 * 권한 관련 서비스
 */
const permissionService = {
	/**
	 * 사용자 ID를 통해 해당 사용자의 모든 권한 코드를 조회하는 메서드
	 * @param {number} userId - 사용자 ID
	 * @returns {Promise<Array<string>>} 권한 코드 목록
	 * @description
	 * - user_role을 통해 사용자의 역할들을 조회
	 * - 각 역할의 role_permission을 통해 권한들을 조회
	 * - 모든 권한의 code를 중복 제거하여 배열로 반환
	 */
	getUserPermissionCodes: async (userId) => {
		// 사용자 존재 여부 확인
		const user = await models.User.findOne({
			where: { id: userId, is_deleted: false },
		});

		if (!user) {
			throw new NotFoundError("해당 사용자를 찾을 수 없습니다.");
		}

		// UserRole을 통해 Role과 Permission을 조회
		const userRoles = await models.UserRole.findAll({
			where: { user_id: userId },
			include: [
				{
					model: models.Role,
					as: "role",
					required: true,
					where: { is_deleted: false },
					include: [
						{
							model: models.Permission,
							as: "permissions",
							through: {
								attributes: [], // RolePermission의 속성은 제외
							},
							attributes: ["code"],
						},
					],
				},
			],
		});

		// 모든 권한 코드를 추출하여 중복 제거
		const permissionCodes = new Set();

		userRoles.forEach((userRole) => {
			if (userRole.role && userRole.role.permissions) {
				userRole.role.permissions.forEach((permission) => {
					if (permission.code) {
						permissionCodes.add(permission.code);
					}
				});
			}
		});

		return Array.from(permissionCodes);
	},
};

export default permissionService;

