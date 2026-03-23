import ActivityModel from "../activity/activity.js";

export default (sequelize, Sequelize) => {
	const activity = ActivityModel(sequelize, Sequelize);

	return sequelize.define(
		"ActivityImage",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "활동 이미지 고유 식별자",
			},
			activity_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "활동 ID, 활동 테이블의 ID를 참조",
				references: {
					model: activity,
					key: "id",
				},
			},
			name: {
				type: Sequelize.TEXT,
				allowNull: false,
				comment: "이미지 이름",
			},
			path: {
				type: Sequelize.TEXT,
				allowNull: false,
				comment: "이미지 경로",
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
			tableName: "activity_image",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "활동 이미지",
		}
	);
};
