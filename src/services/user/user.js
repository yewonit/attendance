import { Op } from "sequelize";
import models from "../../models/models.js";
import {
	DataConflictError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";
import { hashPassword } from "../../utils/password.js";
import { getCurrentSeasonId } from "../../utils/season.js";
import crudService from "../common/crud.js";
import { sequelize } from "../../utils/database.js";
import { sequelize } from "../../utils/database.js";

/**
 * 사용자 관련 서비스
 * @description 사용자 생성/수정 등 CUD 작업에 트랜잭션을 적용합니다.
 * TODO: 이메일/전화번호 변경 시 감사 로그 남기기
 */
const userService = {
	createUser: async (userData, organizationId, idOfCreatingUser) => {
		// 필수 필드 검증
		if (!userData || !organizationId || !idOfCreatingUser) {
			const nullFields = [];
			if (!userData) nullFields.push("userData");
			if (!organizationId) nullFields.push("organizationId");
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

		return await sequelize.transaction(async (t) => {
			// 사용자 생성
			const user = await models.User.create(
				{
					name: userData.name,
					name_suffix: userData.name_suffix,
					gender_type: userData.gender_type,
					birth_date: userData.birth_date,
					phone_number: formatPhoneNumber(userData.phone_number),
					church_registration_date: userData.church_registration_date,
					is_new_member: userData.is_new_member,
				},
				{ transaction: t }
			);

			const organization = await models.Organization.findOne({
				where: {
					id: organizationId,
				},
				transaction: t,
			});
			if (!organization)
				throw new NotFoundError("존재하지 않는 organization입니다.");

			// 사용자와 역할 연결
			await models.UserRole.create(
				{
					user_id: user.id,
					role_id: 5, // 순원
					organization_id: organizationId,
				},
				{ transaction: t }
			);

			// 생성된 사용자 정보 반환
			return user;
		});
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

		return await sequelize.transaction(async (t) => {
			const [updated] = await models.User.update(user, {
				where: { id: id },
				transaction: t,
			});

			return updated;
		});
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

		return await sequelize.transaction(async (t) => {
			const [updated] = await models.User.update(
				{
					id,
					email,
					password: encodedPassword,
				},
				{
					where: { id: id },
					transaction: t,
				}
			);

			return updated;
		});
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

	/**
	 * 👥 이름으로 멤버 검색 (성능 최적화 버전)
	 * - N+1 쿼리 문제 해결: for loop 내 DB 조회 제거
	 * - 사용자 역할 정보를 일괄 조회 후 메모리에서 매핑
	 *
	 * @param {string} name - 검색할 이름
	 * @returns {Array} 검색된 멤버 목록
	 *
	 * TODO: 검색 결과가 많을 경우 페이지네이션 고려
	 */
	searchMembersByName: async (name) => {
		if (!name) {
			const error = new Error("이름이 제공되지 않았습니다.");
			error.status = 400;
			throw error;
		}

		const decodedName = decodeURIComponent(name);

		// 1️⃣ 사용자 테이블에서 이름으로 검색
		const users = await models.User.findAll({
			where: {
				name: {
					[Op.like]: `%${decodedName}%`,
				},
				is_deleted: "N",
			},
			attributes: ["id", "name", "email", "phone_number"],
		});

		if (users.length === 0) {
			return [];
		}

		const userIds = users.map((u) => u.id);
		const currentSeason = getCurrentSeasonId();

		// 2️⃣ 모든 사용자의 역할 및 조직 정보를 일괄 조회
		const userRoles = await models.UserRole.findAll({
			where: {
				user_id: userIds,
			},
			include: [
				{
					model: models.Role,
					as: "role",
					where: { is_deleted: false },
					attributes: ["id", "name"],
				},
				{
					model: models.Organization,
					as: "organization",
					where: {
						season_id: currentSeason,
						is_deleted: false,
					},
					attributes: ["id", "name"],
				},
			],
		});

		// 3️⃣ userId를 키로 하는 Map 생성 (O(1) lookup)
		const rolesByUserId = userRoles.reduce((map, userRole) => {
			if (!map[userRole.user_id]) {
				map[userRole.user_id] = [];
			}
			map[userRole.user_id].push({
				roleName: userRole.role.name,
				organizationId: userRole.organization.id,
				organizationName: userRole.organization.name,
			});
			return map;
		}, {});

		// 4️⃣ 최종 데이터 조합
		const formattedMembers = users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			phoneNumber: user.phone_number,
			roles: rolesByUserId[user.id] || [],
		}));

		return formattedMembers;
	},

	emailDuplicationCheck: async (email) => {
		await emailCheck(email);
	},

	/**
	 * 🎭 현재 시즌의 사용자 역할 조회 (성능 최적화 버전)
	 * - 불필요한 트랜잭션 제거 (읽기 전용)
	 *
	 * @param {number} userId - 사용자 ID
	 * @returns {Array} 사용자의 역할 및 조직 정보
	 */
	getUserRoleOfCurrentSeason: async (userId) => {
		return await getRoleAndOrganization(userId);
	},

	/**
	 * 사용자의 역할에 따라 접근 가능한 조직 목록을 반환하는 메서드
	 * @param {string} email - 사용자 이메일
	 * @param {string} name - 사용자 이름
	 * @returns {Array} 접근 가능한 조직 목록
	 */
	getAccessibleOrganizations: async (email, name) => {
		// 이메일과 이름으로 사용자 찾기
		const user = await models.User.findOne({
			where: {
				email: email,
				name: name,
				is_deleted: false,
			},
		});

		if (!user) {
			throw new NotFoundError("사용자를 찾을 수 없습니다.");
		}

		// 사용자의 역할 정보 가져오기
		const userRoles = await getRoleAndOrganization(user.id);

		if (!userRoles || userRoles.length === 0) {
			throw new NotFoundError("사용자의 역할 정보를 찾을 수 없습니다.");
		}

		// 가장 높은 권한의 역할 찾기
		const highestRole = findHighestRole(userRoles);

		// 역할에 따라 접근 가능한 조직 반환
		return await getOrganizationsByRole(highestRole);
	},
};

const getRoleAndOrganization = async (userId) => {
	const currentSeason = getCurrentSeasonId();

	const result = await models.UserRole.findAll({
		include: [
			{
				model: models.Role,
				as: "role",
				where: {
					is_deleted: false,
				},
				attributes: ["id", "name"],
			},
			{
				model: models.Organization,
				as: "organization",
				where: {
					season_id: currentSeason,
					is_deleted: false,
				},
				attributes: ["id", "name"],
			},
		],
		where: {
			user_id: userId,
		},
	});

	if (!result || result.length === 0) {
		throw new NotFoundError("해당 유저의 역할 정보를 찾을 수 없습니다.");
	}

	const rolesWithOrganization = result.map((userRole) => ({
		roleName: userRole.role.name,
		organizationId: userRole.organization.id,
		organizationName: userRole.organization.name,
	}));

	return rolesWithOrganization;
};

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

const findHighestRole = (userRoles) => {
	const rolePriority = {
		회장단: 4,
		교역자: 4,
		국장: 3,
		그룹장: 2,
		순장: 1,
	};

	return userRoles.reduce((highest, current) => {
		const currentPriority = rolePriority[current.roleName] || 0;
		const highestPriority = rolePriority[highest.roleName] || 0;
		return currentPriority > highestPriority ? current : highest;
	});
};

const getOrganizationsByRole = async (highestRole) => {
	const seasonId = getCurrentSeasonId();
	const highestRoleOrgName = highestRole.organizationName;
	const [currentGook, currentGroup, currentSoon] =
		highestRoleOrgName.split("_");
	const organizationNameDto = (gook, group) => {
		return { gook, group };
	};
	const organizationNames = await models.Organization.findAll({
		where: {
			season_id: seasonId,
			is_deleted: false,
		},
		attributes: ["name"],
	}).then((orgs) =>
		orgs.map((org) => {
			let [gook, group] = org.name.split("_");

			return organizationNameDto(gook, group);
		})
	);

	const result = {
		gook: [],
		group: [],
	};

	switch (highestRole.roleName) {
		case "그룹장":
			result.gook.push(currentGook.slice(0, -1));
			result.group.push(currentGroup.slice(0 - 2));
			return result;

		case "국장":
			result.gook.push(currentGook.slice(0, -1));
			result.group.push(
				Array.from(
					new Set(
						organizationNames
							.filter((orgDto) => orgDto.gook === currentGook && orgDto.group)
							.map((orgDto) => orgDto.group.slice(0, -2))
					)
				)
			);
			return result;

		case "회장단":
		case "교역자":
			organizationNames.forEach((orgDto) => {
				if (orgDto.gook.endsWith("국")) {
					if (!result.gook.includes(orgDto.gook.slice(0, -1))) {
						result.gook.push(orgDto.gook.slice(0, -1));
						result.group.push(
							Array.from(
								new Set(
									organizationNames
										.filter((dto) => orgDto.gook === dto.gook && dto.group)
										.map((dto) => dto.group.slice(0, -2))
								)
							)
						);
					}
				}
			});
			return result;

		default:
			return result;
	}
};

export default userService;
