import OrganizationModel from "../organization/organization.js";

export default (sequelize, Sequelize) => {
	const organization = OrganizationModel(sequelize, Sequelize);

	return sequelize.define(
		"Activity",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "활동 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(100),
				allowNull: false,
				comment: "활동 명칭, 예: 주일1부예배, 원네스 모임",
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "활동 상세 설명",
			},
			activity_category: {
				type: Sequelize.STRING(100),
				allowNull: false,
				comment: "활동 카테고리 타입",
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "조직 ID",
				references: {
					model: organization,
					key: "id",
				},
			},
			start_time: {
				type: Sequelize.DATE,
				allowNull: false,
				comment: "시작 시간",
			},
			end_time: {
				type: Sequelize.DATE,
				allowNull: false,
				comment: "종료 시간",
			},
			is_deleted: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "삭제 여부 (Y/N)",
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "생성 일시",
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "수정 일시",
			},
		},
		{
			tableName: "activity",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "활동 정보를 관리하는 테이블",
		}
	);
};
