import SeasonModel from "../season/season.js";

export default (sequelize, Sequelize) => {
	const season = SeasonModel(sequelize, Sequelize);

	return sequelize.define(
		"Organization",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "조직 고유 식별자",
			},
			season_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				comment: "회기 ID",
				references: {
					model: season,
					key: "id",
				},
			},
			name: {
				type: Sequelize.STRING(50),
				allowNull: false,
				comment: "조직명",
			},
			upper_organization_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				comment: "상위 조직 아이디, 조직간 계층구조를 나타냄",
			},
			is_deleted: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "삭제 여부",
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
		},
		{
			tableName: "organization",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "조직 정보를 관리하는 테이블",
		}
	);
};
