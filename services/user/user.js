// User.Ctrl.js
import models from "../../models/models.js";
import crudService from "../common/crud.js";

const validateUserInfo = async (data) => {
	if (!data.name) {
		const error = new Error("사용자 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.email) {
		const error = new Error("사용자 이메일 주소가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.password) {
		const error = new Error("사용자 비밀번호가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
};

const userService = {
	createUser: crudService.create(models.User, validateUserInfo),

	findUsers: crudService.findAll(models.User),

	findUser: crudService.findOne(models.User),

	updateUser: crudService.update(models.User, validateUserInfo),

	deleteUser: crudService.delete(models.User),

	findUserByName: async (name) => {
		// name = req.query.name

		if (!name) {
			const error = new Error({ message: "이름이 제공되지 않았습니다." });
			error.status = 400;
			throw error;
		}

		const encodedName = name;
		const decodedName = decodeURIComponent(encodedName);

		console.log("\x1b[31m%s\x1b[0m", `처리될 이름: ${decodedName}`);

		const user = await models.User.findOne({ where: { name: decodedName } });
		if (user) {
			return true;
		} else {
			return false;
		}
	},

	checkUserPhoneNumber: async (name, phoneNumber) => {
		// const { name, phoneNumber } = req.body;

		if (!name || !phoneNumber) {
			throw new Error({ message: "이름 또는 전화번호가 제공되지 않았습니다." });
		}

		const user = await models.User.findOne({
			where: { name, phone_number: phoneNumber },
			attributes: { exclude: ["password"] },
		});

		if (!user) {
			throw new Error({
				message: "사용자 정보가 일치하지 않습니다.",
				isMatched: false,
			});
		}

		const userHasRoles = await models.UserHasRole.findAll({
			where: { user_id: user.id },
			attributes: [
				"id",
				"role_id",
				"organization_id",
				"role_start_date",
				"role_end_date",
			],
		});

		const rolesWithOrganization = await Promise.all(
			userHasRoles.map(async (userHasRole) => {
				const role = await models.Role.findOne({
					where: { id: userHasRole.role_id },
					attributes: ["id", "role_name", "created_at"],
				});

				const organization = await models.Organization.findOne({
					where: { id: userHasRole.organization_id },
					attributes: [
						"id",
						"organization_name",
						"organization_description",
						"organization_code",
					],
				});

				return {
					userHasRoleId: userHasRole.id,
					roleId: role.id,
					roleStart: userHasRole.role_start_date,
					roleEnd: userHasRole.role_end_date,
					roleName: role.role_name,
					roleCreatedAt: role.created_at,
					organizationId: organization.id,
					organizationName: organization.organization_name,
					organizationCode: organization.organization_code,
					organizationDescription: organization.organization_description,
				};
			})
		);

		const userData = {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			roles: rolesWithOrganization,
		};

		return userData;
	},
};

export default userService;
