// User.Ctrl.js
import models from "../../models/models.js";
import {
	DataConflictError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";
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
	createUser: async (userData, organizationId, idOfCreatingUser) => {
		// 필수 필드 검증
		if (!userData || !organizationId || !idOfCreatingUser) {
			const nullFields = [];
			if (!userData) nullFields.push("userData");
			if (!organizationId) nullFields.push("organizationId");
			if (!idOfCreatingUser) nullFields.push("idOfCreatingUser");
			throw new ValidationError(
				`필수 필드가 누락되었습니다 : ${nullFields.join(", ")}`
			);
		}

		const userExists = await models.User.findOne({
			where: {
				name: userData.name,
				phone_number: formatPhoneNumber(userData.phone_number),
				is_deleted: "N",
			},
		});
		if (userExists) {
			throw new DataConflictError(
				"이미 같은 전화번호로 생성된 유저가 있습니다."
			);
		}

		// 사용자 생성
		const user = await models.User.create({
			name: userData.name,
			name_suffix: userData.name_suffix,
			gender_type: userData.gender_type,
			birth_date: userData.birth_date,
			country: userData.country,
			phone_number: formatPhoneNumber(userData.phone_number),
			church_registration_date: userData.church_registration_date,
			is_new_member: userData.is_new_member,
			creator_id: idOfCreatingUser,
			updater_id: idOfCreatingUser,
			creator_ip: req.ip,
			updater_ip: req.ip,
		});

		const organization = await models.Organization.findOne({
			where: {
				id: organizationId,
			},
		});
		if (!organization)
			throw new NotFoundError("존재하지 않는 organization입니다.");

		const role = await models.Role.findOne({
			where: {
				organization_id: organizationId,
				role_name: "순원",
			},
		});
		if (!role) throw new NotFoundError("존재하지 않는 role입니다.");

		// 사용자와 역할 연결
		await models.UserHasRole.create({
			user_id: user.id,
			role_id: role.id,
			organization_id: organizationId,
			organization_code: organization.organization_code,
			is_deleted: "N",
			creator_id: idOfCreatingUser,
			updater_id: idOfCreatingUser,
			creator_ip: req.ip,
			updater_ip: req.ip,
			access_service_id: req.headers["x-access-service-id"],
		});

		// 생성된 사용자 정보 반환
		return user;
	},

	findUsers: crudService.findAll(models.User),

	findUser: crudService.findOne(models.User),

	updateUser: async (id, user) => {
		const exist = await models.User.findOne({
			id: id,
		});
		if (!exist) throw new NotFoundError("해당 id로 유저를 찾을 수 없습니다.");

		if (user.email) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(user.email)) {
				throw new ValidationError(
					`이메일이 형식에 맞지 않습니다. email: ${user.email}`
				);
			}

			const sameEmailExists = await models.User.findOne({
				email: user.email,
			});
			if (sameEmailExists) {
				throw new DataConflictError(
					"이미 같은 email로 등록된 유저가 있습니다."
				);
			}
		}

		if (user.password) {
			user.password = Buffer.from(password).toString("base64");
		}

		if (user.phone_number) {
			user.phhone_number = formatPhoneNumber(user.phone_number);
		}

		const [updated] = await models.User.update(user, {
			where: { id: id },
		});

		if (updated) return updated;
	},

	deleteUser: crudService.delete(models.User),

	findUserByName: async (name) => {
		// name = req.query.name

		if (!name) {
			const error = new Error("이름이 제공되지 않았습니다.");
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
		if (!name || !phoneNumber) {
			throw new Error("이름 또는 전화번호가 제공되지 않았습니다.");
		}

		const user = await models.User.findOne({
			where: { name, phone_number: phoneNumber },
			attributes: { exclude: ["password"] },
		});

		if (!user) {
			throw new Error("사용자 정보가 일치하지 않습니다.");
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

const formatPhoneNumber = (phoneNumber) => {
	return phoneNumber.replaceAll(" ", "").replaceAll("-", "");
};

export default userService;
