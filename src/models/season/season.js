// File: Season.Model.js
// Created: 2024-03-19
// Description: 시즌 모델 정의

export default (sequelize, Sequelize) => {
	return sequelize.define(
		"Season",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "시즌 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "시즌 이름",
			},
			is_deleted: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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
		},
		{
			tableName: "season",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "회기 테이블",
		}
	);
};
