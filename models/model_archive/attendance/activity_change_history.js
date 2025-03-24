export default (sequelize, Sequelize) => {
	return sequelize.define(
		"ActivityChangeHistory",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "변경 이력 고유 식별자",
			},
			activity_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "관련 활동 ID",
			},
			changed_fields: {
				type: Sequelize.JSON,
				allowNull: false,
				comment: "변경된 필드와 값",
			},
			change_reason: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "변경 사유",
			},
			created_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "생성 일시",
			},
			creator_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "생성자 ID",
			},
		},
		{
			tableName: "activity_change_history",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "활동 변경 이력 정보를 관리하는 테이블",
		}
	);
};
