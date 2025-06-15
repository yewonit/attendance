export default (sequelize, Sequelize) => {
	return sequelize.define(
		"PermissionGroup",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "권한 그룹 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "권한 그룹 이름",
			},
			description: {
				type: Sequelize.STRING(255),
				allowNull: false,
				comment: "권한 그룹 설명",
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
			tableName: "permission_group",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "권한 그룹 테이블",
		}
	);
};
