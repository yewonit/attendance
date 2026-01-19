import models from "../../models/models.js";
import { NotFoundError } from "../../utils/errors.js";

const ADMIN_USER_IDS = [2520, 2519, 2518, 2517];


const permissionService = {
	
	getUserPermissionCodes: async (userId) => {
		// 어드민 계정 여부 확인
		const isAdmin = ADMIN_USER_IDS.includes(userId);

		// 사용자 존재 여부 확인 (어드민 계정은 is_deleted 체크 제외)
		const userWhere = { id: userId };
		if (!isAdmin) {
			userWhere.is_deleted = false;
		}

		const user = await models.User.findOne({
			where: userWhere,
		});

		if (!user) {
			throw new NotFoundError("해당 사용자를 찾을 수 없습니다.");
		}

		// UserRole을 통해 Role과 Permission을 조회 (어드민 계정은 Role의 is_deleted 체크 제외)
		const roleWhere = {};
		if (!isAdmin) {
			roleWhere.is_deleted = false;
		}

		const userRoles = await models.UserRole.findAll({
			where: { user_id: userId },
			include: [
				{
					model: models.Role,
					as: "role",
					required: true,
					where: roleWhere,
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

