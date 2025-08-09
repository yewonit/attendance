// User.Ctrl.js
import { Op } from "sequelize";
import models from "../../models/models.js";
import {
	DataConflictError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";
import { hashPassword } from "../../utils/password.js";
import { getCurrentSeason } from "../../utils/season.js";
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
			phone_number: formatPhoneNumber(userData.phone_number),
			church_registration_date: userData.church_registration_date,
			is_new_member: userData.is_new_member,
		});

		const organization = await models.Organization.findOne({
			where: {
				id: organizationId,
			},
		});
		if (!organization)
			throw new NotFoundError("존재하지 않는 organization입니다.");

		// 사용자와 역할 연결
		await models.UserRole.create({
			user_id: user.id,
			role_id: 4,	// 순원
			organization_id: organizationId,
		});

		// 생성된 사용자 정보 반환
		return user;
	},

	findUsers: crudService.findAll(models.User),

	findUser: crudService.findOne(models.User),

	updateUser: async (id, user) => {
		const exist = await models.User.findOne({
			where: {
				id: id,
			},
		});
		if (!exist) throw new NotFoundError("해당 id로 유저를 찾을 수 없습니다.");

		if (user.email) {
			await emailCheck(user.email);
		}

		if (user.password) {
			passwordCheck(user.password);
			user.password = await hashPassword(user.password);
		}

		if (user.phone_number) {
			user.phone_number = formatPhoneNumber(user.phone_number);
		}

		const [updated] = await models.User.update(user, {
			where: { id: id },
		});

		return updated;
	},

	setEmailAndPassword: async (id, email, password) => {
		const exist = await models.User.findOne({
			where: {
				id: id,
			},
		});
		if (!exist) throw new NotFoundError("해당 id로 유저를 찾을 수 없습니다.");
		if (exist.email || exist.password)
			throw new ValidationError("이미 이메일과 패스워드가 등록되어있습니다.");

		await emailCheck(email);
		passwordCheck(password);
		const encodedPassword = await hashPassword(password);

		const [updated] = await models.User.update(
			{
				id,
				email,
				password: encodedPassword,
			},
			{
				where: { id: id },
			}
		);

		return updated;
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

		const rolesWithOrganization = await getRoleAndOrganization(user.id);

		const userData = {
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			roles: rolesWithOrganization,
		};

		return userData;
	},

	searchMembersByName: async (name) => {
		if (!name) {
			const error = new Error("이름이 제공되지 않았습니다.");
			error.status = 400;
			throw error;
		}

		const decodedName = decodeURIComponent(name);

		// 사용자 테이블에서 이름으로 검색 - Op.like 직접 사용
		const users = await models.User.findAll({
			where: {
				name: {
					[Op.like]: `%${decodedName}%`,
				},
				is_deleted: "N",
			},
			attributes: { exclude: ["password"] },
		});

		if (users.length === 0) {
			return [];
		}

		// 각 사용자의 역할 및 조직 정보 조회
		const formattedMembers = [];
		for (let user of users) {
			const rolesWithOrganization = await getRoleAndOrganization(user.id);
			formattedMembers.push({
				id: user.id,
				name: user.name,
				email: user.email,
				phoneNumber: user.phone_number,
				roles: rolesWithOrganization,
			});
		}

		return formattedMembers;
	},

	emailDuplicationCheck: async (email) => {
		await emailCheck(email);
	},

	getUserRoleOfCurrentSeason: async (userId) => {
		const rolesWithOrganization = await getRoleAndOrganization(userId);
		return rolesWithOrganization;
	}
};

const getRoleAndOrganization = async (userId) => {
	const currentSeason = getCurrentSeason();

	const result = await models.UserRole.findAll({
		include: [
			{
				model: models.Role,
				where: {
					is_deleted: false
				},
				attributes: ['id', 'name']
			},
			{
				model: models.Organization,
				where: {
					season_id: currentSeason.id,
					is_deleted: false
				},
				attributes: ['id', 'organization_code']
			}
		],
		where: {
			user_id: userId,
			is_deleted: 'N'
		}
	});

	if (!result || result.length === 0) {
		throw new NotFoundError("해당 유저의 역할 정보를 찾을 수 없습니다.");
	}

	const rolesWithOrganization = result.map(userRole => ({
		roleName: userRole.Role.name,
		permissionName: userRole.Role.name, // TODO: 추후 api 수정 시 제거
		organizationId: userRole.Organization.id,
		organizationName: userRole.Organization.organization_code, // TODO: 추후 api 수정 시 제거
		organizationCode: userRole.Organization.organization_code
	}));

	return rolesWithOrganization;
}

const formatPhoneNumber = (phoneNumber) => {
	return phoneNumber.replaceAll(" ", "").replaceAll("-", "");
};

const emailCheck = async (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		throw new ValidationError(`이메일이 형식에 맞지 않습니다. email: ${email}`);
	}

	const sameEmailExists = await models.User.findOne({
		where: {
			email: email,
		},
	});
	if (sameEmailExists) {
		throw new DataConflictError("이미 같은 email로 등록된 유저가 있습니다.");
	}
};

const passwordCheck = (password) => {
	const passwordRegex =
		/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
	if (!passwordRegex.test(password)) {
		throw new ValidationError("패스워드가 형식에 맞지 않습니다.");
	}
};

export default userService;
