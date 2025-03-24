import OrganizationModel from "../organization/organization.js";

export default (sequelize, Sequelize) => {
	const Organization = OrganizationModel(sequelize, Sequelize);

	return sequelize.define(
		"Role",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "역할 고유 식별자",
			},
			role_name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "역할 이름",
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "소속 조직 ID, 조직 테이블의 ID를 참조",
				references: {
					model: Organization,
					key: "id",
				},
			},
			is_deleted: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "삭제 여부 (Y: 삭제됨, N: 활성 상태)",
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "데이터 생성 일시",
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "데이터 최종 수정 일시",
			},
			creator_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "데이터를 생성한 사용자의 ID",
			},
			updater_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "데이터를 마지막으로 수정한 사용자의 ID",
			},
			creator_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "데이터를 생성한 사용자의 IP 주소",
			},
			updater_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "데이터를 마지막으로 수정한 사용자의 IP 주소",
			},
			access_service_id: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "데이터 유입 채널",
			},
		},
		{
			tableName: "role",
			timestamps: true,
			createdAt: created_at,
			updatedAt: updated_at,
			comment: "역할 정보를 관리하는 테이블",
		}
	);
};
