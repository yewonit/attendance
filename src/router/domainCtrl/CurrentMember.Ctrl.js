import models from "../../models/models.js";
import {
	DataConflictError,
	NotFoundError,
	ValidationError,
} from "../../utils/errors.js";

const CurrentMemberCtrl = {
	getMembersWithRoles: async (req, res) => {
		try {
			const { organizationId } = req.query;

			if (!organizationId) {
				return res
					.status(400)
					.json({ message: "조직 ID가 제공되지 않았습니다." });
			}

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

			// 변환된 JSON 배열을 200 상태 코드와 함께 반환합니다.
			return res.status(200).json(members);
		} catch (error) {
			console.error("조직 멤버 조회 중 오류 발생:", error);
			return res.status(500).json({ message: "서버 오류가 발생했습니다." });
		}
	},
	createMember: async (req, res, next) => {
		const { userData, organizationId, idOfCreatingUser } = req.body;

		try {
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
					is_deleted: false,
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
				gender: userData.gender_type,
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
				role_id: 4, // 순원
				organization_id: organizationId,
			});

			// 생성된 사용자 정보 반환
			return res.status(201).json(user);
		} catch (err) {
			next(err);
		}
	},
};

const formatPhoneNumber = (phoneNumber) => {
	return phoneNumber.replaceAll(" ", "").replaceAll("-", "");
};

export default CurrentMemberCtrl;
