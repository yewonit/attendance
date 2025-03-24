import models from "../../models/models.js";

const CurrentMemberCtrl = {
	getMembersWithRoles: async (req, res) => {
		try {
			const { organizationId } = req.query;

			if (!organizationId) {
				return res
					.status(400)
					.json({ message: "조직 ID가 제공되지 않았습니다." });
			}

			// UserHasRole 모델을 사용하여 조직 ID로 필터링합니다.
			const userHasRoles = await models.UserHasRole.findAll({
				where: { organization_id: organizationId },
				include: [
					{
						model: models.User,
						attributes: { exclude: ["password"] },
					},
					{
						model: models.Role,
					},
				],
			});

			// 필터링된 결과가 없는 경우 404 상태 코드와 메시지를 반환합니다.
			if (userHasRoles.length === 0) {
				console.log(
					"%c해당 조직에 소속된 멤버가 없습니다.",
					"color: red; font-size: 16px; font-weight: bold;"
				);
				return res
					.status(404)
					.json({ message: "해당 조직에 소속된 멤버가 없습니다." });
			}

			// 필터링된 결과를 JSON 배열로 변환합니다.
			const members = userHasRoles.map((userHasRole) => {
				const { User: user, Role: role } = userHasRole;
				return {
					userId: user.id,
					name: user.name,
					nameSuffix: user.name_suffix,
					email: user.email,
					genderType: user.gender_type,
					birthDate: user.birth_date,
					address: user.address,
					addressDetail: user.address_detail,
					city: user.city,
					stateProvince: user.state_province,
					country: user.country,
					zipPostalCode: user.zip_postal_code,
					isAddressPublic: user.is_address_public,
					snsUrl: user.sns_url,
					hobby: user.hobby,
					phoneNumber: user.phone_number,
					isPhoneNumberPublic: user.is_phone_number_public,
					churchMemberNumber: user.church_member_number,
					churchRegistrationDate: user.church_registration_date,
					isNewMember: user.is_new_member,
					isLongTermAbsentee: user.is_long_term_absentee,
					isKakaotalkChatMember: user.is_kakaotalk_chat_member,
					roleId: role.id,
					roleName: role.role_name,
				};
			});

			// 변환된 JSON 배열을 200 상태 코드와 함께 반환합니다.
			return res.status(200).json(members);
		} catch (error) {
			console.error("조직 멤버 조회 중 오류 발생:", error);
			return res.status(500).json({ message: "서버 오류가 발생했습니다." });
		}
	},
	createMember: async (req, res) => {
		try {
			const { userData, organizationId, organizationCode, idOfCreatingUser } =
				req.body;

			// 필수 필드 검증
			if (!userData || !organizationId || !idOfCreatingUser) {
				return res.status(400).json({ message: "필수 필드가 누락되었습니다." });
			}

			// 사용자 생성
			const user = await models.User.create({
				name: userData.name,
				name_suffix: userData.name_suffix,
				gender_type: userData.gender_type,
				birth_date: userData.birth_date,
				country: userData.country,
				phone_number: formatPhoneNumber(userData.phone_number),
				church_member_number: userData.church_member_number,
				church_registration_date: userData.church_registration_date,
				is_new_member: userData.is_new_member,
				creator_id: idOfCreatingUser,
				updater_id: idOfCreatingUser,
				creator_ip: req.ip,
				updater_ip: req.ip,
			});

			const role = await models.Role.findOne({
				where: {
					organization_id: organizationId,
					role_name: "순원",
				},
			});

			// 사용자와 역할 연결
			await models.UserHasRole.create({
				user_id: user.id,
				role_id: role.id,
				organization_id: organizationId,
				organization_code: organizationCode,
				is_deleted: "N",
				creator_id: idOfCreatingUser,
				updater_id: idOfCreatingUser,
				creator_ip: req.ip,
				updater_ip: req.ip,
				access_service_id: req.headers["x-access-service-id"],
			});

			// 생성된 사용자 정보 반환
			return res.status(201).json(user);
		} catch (error) {
			console.error("멤버 생성 중 오류 발생:", error);
			return res.status(500).json({ message: "서버 오류가 발생했습니다." });
		}
	},
};

const formatPhoneNumber = (phoneNumber) => {
	return phoneNumber.replace(" ", "").replace("-", "");
};

export default CurrentMemberCtrl;
