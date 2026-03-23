import { Op } from "sequelize";
import models from "../../models/models.js";
import {
	DataConflictError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";
import { hashPassword } from "../../utils/password.js";
import seasonService from "../season/season.js";
import crudService from "../common/crud.js";
import { sequelize } from "../../utils/database.js";
import { buildOrganizationNamePattern, parseOrganizationName } from "../../utils/organization.js";
import { getRecentSunday } from "../attendance/modules/recentSunday.js";

/**
 * 사용자 관련 서비스
 * @description 사용자 생성/수정 등 CUD 작업에 트랜잭션을 적용합니다.
 * TODO: 이메일/전화번호 변경 시 감사 로그 남기기
 */
const userService = {
	createUser: async (name, gender, nameSuffix, birthDate, phoneNumber, organizationId) => {
		// 필수 필드 검증
		if (!name || !gender || !organizationId) {
			const nullFields = [];
			if (!name) nullFields.push("name");
			if (!gender) nullFields.push("gender");
			if (!organizationId) nullFields.push("organizationId");
			throw new ValidationError(
				`필수 필드가 누락되었습니다 : ${nullFields.join(", ")}`
			);
		}

		const userExists = await models.User.findOne({
			where: {
				name: name,
				phone_number: formatPhoneNumber(phoneNumber),
				is_deleted: false,
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
					name: name,
					name_suffix: nameSuffix || 'AAA',
					gender: gender,
					birth_date: birthDate,
					phone_number: formatPhoneNumber(phoneNumber),
					registration_date: getRecentSunday(),
					is_new_member: true,
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

	/**
	 * 복수 사용자 일괄 생성
	 * @description 단일 트랜잭션으로 여러 사용자를 한 번에 생성합니다.
	 * 하나라도 실패 시 전체 롤백됩니다.
	 * @param {Array<{name, gender, nameSuffix?, birthDate?, phone?, organizationId}>} users
	 * @returns {Array} 생성된 사용자 목록
	 * TODO: bulkCreate 활용한 성능 최적화 고려
	 */
	createUsers: async (users) => {
		if (!Array.isArray(users) || users.length === 0) {
			throw new ValidationError("사용자 목록이 비어있습니다.");
		}

		users.forEach((user, i) => {
			const nullFields = [];
			if (!user.name) nullFields.push("name");
			if (!user.gender) nullFields.push("gender");
			if (!user.organizationId) nullFields.push("organizationId");
			if (nullFields.length > 0) {
				throw new ValidationError(
					`${i + 1}번째 사용자: 필수 필드가 누락되었습니다 : ${nullFields.join(", ")}`
				);
			}
		});

		// 기존 사용자 중복 체크 (이름 + 전화번호 조합)
		const duplicateConditions = users
			.filter((u) => u.phone || u.email)
			.map((u) => ({
				name: u.name,
				phone_number: formatPhoneNumber(u.phone),
				...(u.email && { email: u.email }),
				is_deleted: false,
			}));

		if (duplicateConditions.length > 0) {
			const existingUsers = await models.User.findAll({
				where: { [Op.or]: duplicateConditions },
			});
			if (existingUsers.length > 0) {
				const names = existingUsers.map((u) => u.name).join(", ");
				throw new DataConflictError(
					`이미 같은 전화번호 또는 이메일로 생성된 유저가 있습니다: ${names}`
				);
			}
		}

		// 조직 존재 여부 일괄 확인
		const organizationIds = [...new Set(users.map((u) => u.organizationId))];
		const organizations = await models.Organization.findAll({
			where: { id: organizationIds },
		});
		const foundOrgIds = new Set(organizations.map((o) => o.id));
		const missingOrgIds = organizationIds.filter((id) => !foundOrgIds.has(id));
		if (missingOrgIds.length > 0) {
			throw new NotFoundError(
				`존재하지 않는 organization입니다. (organizationId: ${missingOrgIds.join(", ")})`
			);
		}

		return await sequelize.transaction(async (t) => {
			const createdUsers = [];

			for (const u of users) {
				const user = await models.User.create(
					{
						name: u.name,
						name_suffix: u.nameSuffix || "AAA",
						email: u.email,
						gender: u.gender,
						birth_date: u.birthDate,
						phone_number: formatPhoneNumber(u.phone),
						registration_date: getRecentSunday(),
						is_new_member: true,
					},
					{ transaction: t }
				);

				await models.UserRole.create(
					{
						user_id: user.id,
						role_id: 5,
						organization_id: u.organizationId,
					},
					{ transaction: t }
				);

				createdUsers.push(user);
			}

			return createdUsers;
		});
	},

	findUsers: crudService.findAll(models.User),

	findUser: crudService.findOne(models.User),

	updateUser: async (id, user) => {
		const exist = await models.User.findOne({
			where: { id },
		});
		if (!exist) throw new NotFoundError("해당 id로 유저를 찾을 수 없습니다.");

		if (user.email) {
			await emailCheck(user.email);
		}

		if (user.password) {
			passwordCheck(user.password);
			user.password = await hashPassword(user.password);
		}

		if (user.phone) {
			user.phone = formatPhoneNumber(user.phone);
		}

		if (user.organizationId) {
			const organization = await models.Organization.findOne({
				where: { id: user.organizationId },
			});
			if (!organization) {
				throw new NotFoundError(
					`존재하지 않는 organization입니다. (organizationId: ${user.organizationId})`
				);
			}
		}

		const updateData = {
			...(user.name && { name: user.name }),
			...(user.nameSuffix && { name_suffix: user.nameSuffix }),
			...(user.email && { email: user.email }),
			...(user.password && { password: user.password }),
			...(user.gender && { gender: user.gender }),
			...(user.birthDate && { birth_date: user.birthDate }),
			...(user.phone && { phone_number: user.phone }),
		};

		return await sequelize.transaction(async (t) => {
			const [updated] = await models.User.update(updateData, {
				where: { id },
				transaction: t,
			});

			if (user.organizationId) {
				await models.UserRole.update(
					{ organization_id: user.organizationId },
					{
						where: { user_id: id },
						transaction: t,
					}
				);
			}

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
				is_deleted: false,
			},
			attributes: ["id", "name", "email", "phone_number"],
		});

		if (users.length === 0) {
			return [];
		}

		const userIds = users.map((u) => u.id);
		const currentSeason = await seasonService.getCurrentSeasonId();

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
	 * @description
	 * - 어드민 계정(user id: 2520, 2519, 2518, 2517)은 is_deleted 체크를 건너뜀
	 */
	getAccessibleOrganizations: async (email, name) => {
		// 이메일과 이름으로 사용자 찾기 (어드민 계정은 is_deleted 체크 제외)
		const userWhere = {
			email: email,
			name: name,
		};

		// 먼저 사용자 조회 (is_deleted 체크 없이)
		const user = await models.User.findOne({
			where: userWhere,
		});

		if (!user) {
			throw new NotFoundError("사용자를 찾을 수 없습니다.");
		}

		// 어드민 계정 여부 확인
		const isAdmin = ADMIN_USER_IDS.includes(user.id);

		// 어드민이 아니고 is_deleted가 true인 경우 에러
		if (!isAdmin && user.is_deleted) {
			throw new NotFoundError("사용자를 찾을 수 없습니다.");
		}

		// 사용자의 역할 정보 가져오기
		const userRoles = await getRoleAndOrganization(user.id);

		if (!userRoles || userRoles.length === 0) {
			throw new NotFoundError("사용자의 역할 정보를 찾을 수 없습니다.");
		}

		// 가장 높은 권한의 역할 찾기
		const highestRole = findHighestRole(userRoles);

		// 역할에 따라 접근 가능한 조직 반환 (userId 전달)
		return await getOrganizationsByRole(highestRole, user.id);
	},

	/**
	 * 👶 모든 조직의 새가족을 한 번에 조회 (성능 최적화)
	 * - 단일 SQL 쿼리로 모든 새가족 조회
	 * - JOIN을 활용하여 조직 정보와 역할 정보 포함
	 * - 프론트엔드의 N+1 쿼리 문제 해결
	 *
	 * @returns {Array<Object>} 새가족 목록 (조직 정보 포함)
	 *
	 * @example
	 * // 반환 예시:
	 * [
	 *   {
	 *     userId: 123,
	 *     name: "홍길동",
	 *     nameSuffix: "A",
	 *     phoneNumber: "01012345678",
	 *     gender: "M",
	 *     email: "hong@example.com",
	 *     birthDate: "1990-05-15",
	 *     isNewMember: true,
	 *     isLongTermAbsentee: false,
	 *     registrationDate: "2024-01-15T00:00:00.000Z",
	 *     roleId: 5,
	 *     roleName: "순원",
	 *     organizationId: 10,
	 *     organizationName: "3국_김보연그룹_1순"
	 *   }
	 * ]
	 *
	 * TODO: 필요시 시즌별 필터링 추가 고려
	 * TODO: 페이지네이션 추가 고려 (새가족이 매우 많아질 경우)
	 */
	getAllNewMembers: async () => {
		const currentSeason = await seasonService.getCurrentSeasonId();

		// UserRole을 통해 User, Role, Organization 정보를 한 번에 조회
		const newMembers = await models.UserRole.findAll({
			include: [
				{
					model: models.User,
					as: "user",
					required: true,
					where: {
						is_new_member: true, // 새가족만 조회
						is_deleted: false, // 삭제되지 않은 사용자만
					},
					attributes: [
						"id",
						"name",
						"name_suffix",
						"phone_number",
						"gender",
						"email",
						"birth_date",
						"is_new_member",
						"is_long_term_absentee",
						"registration_date",
					],
				},
				{
					model: models.Role,
					as: "role",
					required: false, // 역할이 없을 수도 있으므로 LEFT JOIN
					where: { is_deleted: false },
					attributes: ["id", "name"],
				},
				{
					model: models.Organization,
					as: "organization",
					required: true, // 조직은 반드시 있어야 함
					where: {
						season_id: currentSeason,
						is_deleted: false,
					},
					attributes: ["id", "name"],
				},
			],
			order: [
				[{ model: models.User, as: "user" }, "registration_date", "DESC"],
			],
		});

		// 데이터 변환 및 포맷팅
		return newMembers.map((userRole) => {
			const user = userRole.user;
			const role = userRole.role;
			const organization = userRole.organization;

			return {
				userId: user.id,
				name: user.name,
				nameSuffix: user.name_suffix || "",
				phoneNumber: user.phone_number,
				gender: user.gender || null,
				email: user.email || null,
				birthDate: user.birth_date || null,
				isNewMember: user.is_new_member,
				isLongTermAbsentee: user.is_long_term_absentee,
				registrationDate: user.registration_date,
				roleId: role?.id || null,
				roleName: role?.name || "순원",
				organizationId: organization.id,
				organizationName: organization.name,
			};
		});
	},
	changeOrganization: async (id, organizationId, roleName) => {
		const currentSeason = await seasonService.getCurrentSeasonId();
		
		const userRole = await models.UserRole.findOne({
			where: { user_id: id},
			include: [
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
		if (!userRole) throw new NotFoundError("해당 유저의 역할을 찾을 수 없습니다.");

		const role = await models.Role.findOne({
			where: { name: roleName },
			attributes: ["id", "name"],
		});
		if (!role) throw new NotFoundError("해당 역할을 찾을 수 없습니다.");

		await sequelize.transaction(async (t) => {
			await models.UserRole.update({
				role_id: role.id,
				organization_id: organizationId,
			}, {
				where: { id: userRole.id },
				transaction: t,
			});
		});
	},

	/**
	 * 👥 구성원 목록 조회 (검색/필터링/페이지네이션 지원)
	 * - 이름 검색 기능
	 * - 소속국/소속그룹/소속순 필터링
	 * - 페이지네이션 지원
	 * - 소속 정보 포함 응답
	 *
	 * @param {Object} filters - 필터 조건
	 * @param {string} filters.search - 이름 검색어
	 * @param {string} filters.department - 소속국 필터 (예: "1국")
	 * @param {string} filters.group - 소속그룹 필터 (예: "김민수그룹")
	 * @param {string} filters.team - 소속순 필터 (예: "이용걸순")
	 * @param {number} filters.page - 페이지 번호 (기본값: 1)
	 * @param {number} filters.limit - 페이지당 항목 수 (기본값: 10)
	 * @returns {Promise<{members: Array, pagination: Object}>} 구성원 목록 및 페이지네이션 정보
	 */
	getMembersWithFilters: async (filters = {}) => {
		const {
			search,
			department,
			group,
			team,
			page = 1,
			limit = 10
		} = filters;

		// 페이지네이션 파라미터 유효성 검증
		const pageNum = Math.max(1, parseInt(page) || 1);
		const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
		const offset = (pageNum - 1) * limitNum;

		const currentSeason = await seasonService.getCurrentSeasonId();

		// 기본 WHERE 조건 구성
		const userWhere = {
			is_deleted: false
		};

		// 이름 검색 조건 추가
		if (search && search.trim()) {
			userWhere.name = {
				[Op.like]: `%${search.trim()}%`
			};
		}

		// 조직 필터 조건 구성
		const organizationWhere = {
			season_id: currentSeason,
			is_deleted: false
		};

		// 조직명 필터링
		const orgNamePattern = buildOrganizationNamePattern(department, group, team);
		if (orgNamePattern) {
			organizationWhere.name = {
				[Op.like]: `${orgNamePattern}%`
			};
		}

		// 1️⃣ 구성원 목록 및 전체 개수 조회 (findAndCountAll 사용)
		const { count: totalCount, rows: users } = await models.User.findAndCountAll({
			where: userWhere,
			include: [
				{
					model: models.UserRole,
					as: "userRoles",
					required: true,
					include: [
						{
							model: models.Organization,
							as: "organization",
							required: true,
							where: organizationWhere,
							attributes: ["id", "name"]
						},
						{
							model: models.Role,
							as: "role",
							required: true,
							where: { is_deleted: false },
							attributes: ["id", "name"]
						}
					],
					attributes: ["id", "user_id", "organization_id", "role_id"]
				}
			],
			attributes: [
				"id",
				"name",
				"birth_date",
				"phone_number"
			],
			order: [["name", "ASC"]],
			limit: limitNum,
			offset: offset,
			distinct: true,
			subQuery: false
		});

		// 2️⃣ 페이지네이션 메타데이터 계산
		const totalPages = Math.ceil(totalCount / limitNum);
		const pagination = {
			currentPage: pageNum,
			totalPages: totalPages,
			totalCount: totalCount,
			limit: limitNum
		};

		// 4️⃣ 응답 데이터 포맷팅
		const formattedMembers = users.map((user) => {
			// 각 사용자의 주요 역할 및 조직 정보 (첫 번째 UserRole 사용)
			const primaryUserRole = user.userRoles && user.userRoles.length > 0 
				? user.userRoles[0] 
				: null;

			const organization = primaryUserRole?.organization;
			const role = primaryUserRole?.role;

			// 조직명 파싱
			const orgInfo = organization 
				? parseOrganizationName(organization.name)
				: { department: null, group: null, team: null };

			// 생년월일을 생일연도(YY)로 변환
			let birthYear = null;
			if (user.birth_date) {
				const year = new Date(user.birth_date).getFullYear();
				birthYear = year.toString().slice(-2); // 마지막 2자리만 추출
			}

			return {
				id: user.id,
				name: user.name,
				birthYear: birthYear,
				phoneNumber: user.phone_number,
				affiliation: {
					department: orgInfo.department || null,
					group: orgInfo.group || null,
					team: orgInfo.team || null
				},
				role: role?.name || null
			};
		});

		// 빈 결과 처리
		if (formattedMembers.length === 0) {
			return {
				members: [],
				pagination
			};
		}

		return {
			members: formattedMembers,
			pagination
		};
	},
	setFalseIsNewMember: async () => {
		await models.User.update({
			is_new_member: false,
		}, {
		where: {
			is_new_member: true,
			registration_date: {
				[Op.lte]: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
			},
		},
		});
	},
	/**
	 * 장결자 상태를 갱신하는 메서드
	 * - 청년예배 연속 결석 0회인 장결자 → 장결 해제
	 * - 청년예배 연속 결석 4회인 비장결자 → 장결 설정
	 */
	setIsLongTermAbsentee: async () => {
		// 장결자인데 청년예배 연속 결석이 0회인 유저 → 장결 해제
		const toUnset = await models.UserAttendanceAggregate.findAll({
			attributes: ['user_id'],
			where: { activity_type: '청년예배', absence_continuous_count: 0 },
			include: [{
				model: models.User,
				as: 'user',
				where: { is_long_term_absentee: true },
				attributes: [],
			}],
			raw: true,
		});

		if (toUnset.length > 0) {
			await models.User.update(
				{ is_long_term_absentee: false },
				{ where: { id: toUnset.map(r => r.user_id) } }
			);
		}

		// 비장결자인데 청년예배 연속 결석이 4회인 유저 → 장결 설정
		const toSet = await models.UserAttendanceAggregate.findAll({
			attributes: ['user_id'],
			where: { activity_type: '청년예배', absence_continuous_count: 4 },
			include: [{
				model: models.User,
				as: 'user',
				where: { is_long_term_absentee: false },
				attributes: [],
			}],
			raw: true,
		});

		if (toSet.length > 0) {
			await models.User.update(
				{ is_long_term_absentee: true },
				{ where: { id: toSet.map(r => r.user_id) } }
			);
		}
	},
};

const ADMIN_USER_IDS = [2520, 2519, 2518, 2517];

const getRoleAndOrganization = async (userId) => {
	const currentSeason = await seasonService.getCurrentSeasonId();

	// 어드민 계정 여부 확인
	const isAdmin = ADMIN_USER_IDS.includes(userId);

	// Role과 Organization의 where 조건 구성 (어드민 계정은 is_deleted 체크 제외)
	const roleWhere = {};
	if (!isAdmin) {
		roleWhere.is_deleted = false;
	}

	const organizationWhere = {
		season_id: currentSeason,
	};
	if (!isAdmin) {
		organizationWhere.is_deleted = false;
	}

	const result = await models.UserRole.findAll({
		include: [
			{
				model: models.Role,
				as: "role",
				where: roleWhere,
				attributes: ["id", "name", "level"],
			},
			{
				model: models.Organization,
				as: "organization",
				where: organizationWhere,
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
		roleLevel: userRole.role.level,
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
	return userRoles.reduce((highest, current) => {
		const currentLevel = current.roleLevel ?? Infinity;
		const highestLevel = highest.roleLevel ?? Infinity;
		return currentLevel < highestLevel ? current : highest;
	});
};

/**
 * 역할에 따라 접근 가능한 조직 목록 조회
 * @param {Object} highestRole - 가장 높은 권한의 역할 정보
 * @param {number} userId - 사용자 ID (어드민 체크용)
 * @returns {Promise<Object>} 접근 가능한 조직 목록
 * @description
 * - 어드민 계정(user id: 2520, 2519, 2518, 2517)은 is_deleted 체크를 건너뜀
 * - 순장/부그룹장은 상위 조직(그룹장의 조직)을 찾아서 그룹장과 동일한 접근 권한을 가짐
 */
const getOrganizationsByRole = async (highestRole, userId) => {
	const seasonId = await seasonService.getCurrentSeasonId();
	
	// 어드민 계정 여부 확인
	const isAdmin = ADMIN_USER_IDS.includes(userId);

	// Organization 조회 조건 구성 (어드민 계정은 is_deleted 체크 제외)
	const organizationWhere = {
		season_id: seasonId,
	};
	if (!isAdmin) {
		organizationWhere.is_deleted = false;
	}

	const organizationNameDto = (gook, group) => {
		return { gook, group };
	};

	const organizationNames = await models.Organization.findAll({
		where: organizationWhere,
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

	// 순장/부그룹장인 경우 상위 조직(그룹장의 조직)을 찾아서 그룹장 로직 적용
	if (highestRole.roleName === "순장" || highestRole.roleName === "부그룹장") {
		// 현재 조직의 상위 조직 조회
		const currentOrganization = await models.Organization.findOne({
			where: {
				id: highestRole.organizationId,
				season_id: seasonId,
			},
			attributes: ["upper_organization_id"],
		});

		if (!currentOrganization || !currentOrganization.upper_organization_id) {
			// 상위 조직이 없는 경우 빈 결과 반환
			return result;
		}

		// 상위 조직(그룹장의 조직) 조회
		const upperOrgWhere = {
			id: currentOrganization.upper_organization_id,
			season_id: seasonId,
		};
		if (!isAdmin) {
			upperOrgWhere.is_deleted = false;
		}

		const upperOrganization = await models.Organization.findOne({
			where: upperOrgWhere,
			attributes: ["name"],
		});

		if (!upperOrganization) {
			// 상위 조직을 찾을 수 없는 경우 빈 결과 반환
			return result;
		}

		// 상위 조직의 이름을 파싱하여 그룹장과 동일한 로직 적용
		const upperOrgName = upperOrganization.name;
		const [upperGook, upperGroup] = upperOrgName.split("_");

		result.gook.push(upperGook.slice(0, -1));
		result.group.push([upperGroup.slice(0, -2)]);
		return result;
	}

	// 그룹장 및 기타 역할 처리
	const highestRoleOrgName = highestRole.organizationName;
	const [currentGook, currentGroup, currentSoon] =
		highestRoleOrgName.split("_");

	switch (highestRole.roleName) {
		case "순장":
		case "부그룹장":
		case "그룹장":
			result.gook.push(currentGook.slice(0, -1));
			result.group.push([currentGroup.slice(0, -2)]);
			return result;

		case "부국장":
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
