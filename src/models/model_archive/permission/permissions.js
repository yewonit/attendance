export default (sequelize, Sequelize) => {
	return sequelize.define(
		"Permissions",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "권한 고유 식별자",
			},
			permission_code: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "권한 코드",
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
			tableName: "permissions",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "권한 테이블",
		}
	);
};
