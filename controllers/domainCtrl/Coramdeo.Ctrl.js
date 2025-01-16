const models = require("../../models/models");
const { Op } = require("sequelize");

const coramdeoController = {
	initCoramdeoActivities: async (req, res, next) => {
		try {
			const seasonName = req.body.season_name;
			const season = await models.Season.findOne({
				where: {
					season_name: seasonName,
				},
			});

			const organizations = await models.Organization.findAll({
				where: {
					[Op.and]: [
						{ season_id: season.id },
						{ organization_code: { [Op.like]: "CORAMDEO_SOON_%" } },
					],
				},
			});

			organizations.map(async (organization) => {
				await models.Activity.findOrCreate({
					where: {
						name: "주일2부예배",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 주일 2부 예배`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "주일3부예배",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 주일 3부 예배`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "청년예배",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 청년 예배`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "수요예배",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 수요 예배`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "금요예배",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 금요 예배`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "수요제자기도회",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 수요 제자 기도회`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
				await models.Activity.findOrCreate({
					where: {
						name: "현장치유팀사역",
						organization_id: organization.id,
					},
					defaults: {
						description: `${organization.organization_name}의 현장 치유 팀사역`,
						activity_category_id: 101,
						is_recurring: 1,
						location_type: "OFFLINE",
						default_start_time: "00:00:00",
						default_end_time: "00:00:00",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						access_service_id: "SYSTEM",
					},
				});
			});

			res
				.status(201)
				.json({ created: organizations.length, message: "생성 완료" });
		} catch (error) {
			next(error);
		}
	},
	updateCoramdeoMember: async (req, res, next) => {
		const YEAR = 2025;
		const ORGANIZATION_CODE = "CORAMDEO";
		try {
			const memberList = req.body;

			// 데이터 유효성 검사
			if (!Array.isArray(memberList)) {
				return res.status(400).json({
					message: "요청 데이터가 배열 형식이 아닙니다.",
				});
			}

			if (memberList.length === 0) {
				return res.status(400).json({
					message: "업데이트할 멤버 데이터가 없습니다.",
				});
			}

			// 1. Season 확인 및 생성
			console.log("Season 확인 및 생성 시작");
			let season = await models.Season.findOne({
				where: {
					season_name: YEAR.toString(),
					is_deleted: "N",
				},
			});

			if (!season) {
				// Season이 없으면 생성
				console.log("Season 미 존재로 생성");
				season = await models.Season.create({
					season_name: YEAR.toString(),
					creator_id: 1, // 시스템 사용자 ID
					updater_id: 1,
					creator_ip: "127.0.0.1",
					updater_ip: "127.0.0.1",
					access_service_id: "SYSTEM",
				});
			}
			console.log("Season 확인 및 생성 완료");

			// 2. Organization 확인 및 생성
			console.log("Coramdeo Org 확인 및 생성 시작");
			let coramdeo = await models.Organization.findOne({
				where: {
					season_id: season.id,
					organization_code: ORGANIZATION_CODE,
					is_deleted: "N",
				},
			});

			if (!coramdeo) {
				// Organization이 없으면 생성
				console.log("Coramdeo Org 미 존재로 생성");
				coramdeo = await models.Organization.create({
					organization_name: "코람데오 청년선교회",
					organization_code: ORGANIZATION_CODE,
					organization_description: "코람데오 청년선교회",
					upper_organization_id: 1,
					start_date: `${YEAR - 1}-12-01`,
					end_date: `${YEAR}-11-30`,
					season_id: season.id,
					creator_id: 1,
					updater_id: 1,
					creator_ip: "127.0.0.1",
					updater_ip: "127.0.0.1",
					is_deleted: "N",
					access_service_id: "SYSTEM",
				});
			}
			console.log("Coramdeo Org 확인 및 생성 완료");
			console.log("Coramdeo Org ID:", coramdeo.id);

			for (let member of memberList) {
				let gook = member["국"];
				let group = member["그룹"];
				let soon = member["순"];
				let name = member["이름"];
				let gender = member["성별"];
				let ageYear = member["기수"];
				let phone = member["연락처"];
				let role = member["직분"];

				console.log(name, "등록 시작");

				let gookOrganization = await models.Organization.findOne({
					where: {
						season_id: season.id,
						organization_code: `${ORGANIZATION_CODE}_GOOK_${gook}`,
						is_deleted: "N",
					},
				});

				if (!gookOrganization) {
					// Organization이 없으면 생성
					gookOrganization = await models.Organization.create({
						organization_name: `코람데오_${gook}국`,
						organization_code: `${ORGANIZATION_CODE}_GOOK_${gook}`,
						organization_description: `코람데오_${gook}국`,
						upper_organization_id: coramdeo.id,
						start_date: `${YEAR - 1}-12-01`,
						end_date: `${YEAR}-11-30`,
						season_id: season.id,
						creator_id: 1, // 시스템 사용자 ID
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						is_deleted: "N",
						access_service_id: "SYSTEM",
					});
				}
				console.log(name, "국 등록 완료");

				let groupOrganization = await models.Organization.findOne({
					where: {
						season_id: season.id,
						organization_code: `${ORGANIZATION_CODE}_GROUP_${group}`,
						is_deleted: "N",
					},
				});

				if (!groupOrganization) {
					// Organization이 없으면 생성
					groupOrganization = await models.Organization.create({
						organization_name: `코람데오_${gook}국_${group}`,
						organization_code: `${ORGANIZATION_CODE}_GROUP_${group}`,
						organization_description: `코람데오_${gook}국_${group}`,
						upper_organization_id: gookOrganization.id,
						start_date: `${YEAR - 1}-12-01`,
						end_date: `${YEAR}-11-30`,
						season_id: season.id,
						creator_id: 1, // 시스템 사용자 ID
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						is_deleted: "N",
						access_service_id: "SYSTEM",
					});
				}
				console.log(name, "그룹 등록 완료");

				let soonOrganization = await models.Organization.findOne({
					where: {
						season_id: season.id,
						organization_code: `${ORGANIZATION_CODE}_SOON_${soon}`,
						is_deleted: "N",
					},
				});

				if (!soonOrganization) {
					// Organization이 없으면 생성
					soonOrganization = await models.Organization.create({
						organization_name: `코람데오_${gook}국_${group}_${soon}`,
						organization_code: `${ORGANIZATION_CODE}_SOON_${soon}`,
						organization_description: `코람데오_${gook}국_${group}_${soon}`,
						upper_organization_id: groupOrganization.id,
						start_date: `${YEAR - 1}-12-01`,
						end_date: `${YEAR}-11-30`,
						season_id: season.id,
						creator_id: 1, // 시스템 사용자 ID
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
						is_deleted: "N",
						access_service_id: "SYSTEM",
					});
				}
				console.log(name, "순 등록 완료");

				let roleData = undefined;
				if (role === "그룹장") {
					roleData = await models.Role.findOne({
						where: {
							role_name: role,
							organization_id: groupOrganization.id,
							is_deleted: "N",
						},
					});

					if (!roleData) {
						roleData = await models.Role.create({
							role_name: role,
							organization_id: groupOrganization.id,
							is_deleted: "N",
							creator_id: 1,
							updater_id: 1,
							creator_ip: "127.0.0.1",
							updater_ip: "127.0.0.1",
							access_service_id: 1,
						});
					}
				} else if (role === "부그룹장") {
					roleData = await models.Role.findOne({
						where: {
							role_name: role,
							organization_id: groupOrganization.id,
							is_deleted: "N",
						},
					});

					if (!roleData) {
						roleData = await models.Role.create({
							role_name: role,
							organization_id: groupOrganization.id,
							is_deleted: "N",
							creator_id: 1,
							updater_id: 1,
							creator_ip: "127.0.0.1",
							updater_ip: "127.0.0.1",
							access_service_id: 1,
						});
					}
				} else if (role === "순장") {
					roleData = await models.Role.findOne({
						where: {
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
						},
					});

					if (!roleData) {
						roleData = await models.Role.create({
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
							creator_id: 1,
							updater_id: 1,
							creator_ip: "127.0.0.1",
							updater_ip: "127.0.0.1",
							access_service_id: 1,
						});
					}
				} else if (role === "EBS") {
					roleData = await models.Role.findOne({
						where: {
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
						},
					});

					if (!roleData) {
						roleData = await models.Role.create({
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
							creator_id: 1,
							updater_id: 1,
							creator_ip: "127.0.0.1",
							updater_ip: "127.0.0.1",
							access_service_id: 1,
						});
					}
				} else {
					role = "순원";
					roleData = await models.Role.findOne({
						where: {
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
						},
					});

					if (!roleData) {
						roleData = await models.Role.create({
							role_name: role,
							organization_id: soonOrganization.id,
							is_deleted: "N",
							creator_id: 1,
							updater_id: 1,
							creator_ip: "127.0.0.1",
							updater_ip: "127.0.0.1",
							access_service_id: 1,
						});
					}
				}
				console.log(name, "직분 생성 완료");

				let user = await models.User.findOne({
					where: {
						name: name,
						phone_number: phone.replaceAll("-", ""),
						is_deleted: "N",
					},
				});

				if (!user) {
					user = await models.User.create({
						name: name,
						phone_number: phone.replaceAll("-", ""),
						is_deleted: "N",
						name_suffix: "",
						email: "",
						password: "",
						gender_type: gender === "남" ? "M" : "F",
						birth_date:
							ageYear !== ""
								? ageYear.toString().startsWith("0")
									? `20${ageYear}-01-01`
									: `19${ageYear}-01-01`
								: undefined,
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
					});
				}
				console.log(name, "유저 등록 완료");

				let userHasRole = await models.UserHasRole.findOne({
					where: {
						user_id: user.id,
						role_id: roleData.id,
						organization_id: soonOrganization.id,
						is_deleted: "N",
					},
				});

				if (!userHasRole) {
					await models.UserHasRole.create({
						user_id: user.id,
						role_id: roleData.id,
						organization_id: soonOrganization.id,
						organization_code: `${ORGANIZATION_CODE}_SOON_${soon}`,
						is_deleted: "N",
						creator_id: 1,
						updater_id: 1,
						creator_ip: "127.0.0.1",
						updater_ip: "127.0.0.1",
					});
				}
				console.log(name, "직분 등록 완료");
			}

			// 임시 응답 (개발 중)
			res.status(200).json({
				message: "초기 설정 완료",
			});
		} catch (error) {
			console.error("Error in bulkCreateMembers:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
			});
		}
	},
};

module.exports = coramdeoController;
