import UserModel from "../user/user.js";
import ActivityModel from "../activity/activity.js";

export default (sequelize, Sequelize) => {
	const user = UserModel(sequelize, Sequelize);
	const activity = ActivityModel(sequelize, Sequelize);

	return sequelize.define(
		"Attendance",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "출석 기록 고유 식별자",
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "사용자 ID",
				references: {
					model: user,
					key: "id",
				},
			},
			activity_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "활동 인스턴스 ID",
				references: {
					model: activity,
					key: "id",
				},
			},
			attendance_status: {
				type: Sequelize.STRING(10),
				allowNull: false,
				comment: "출석 상태",
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
			tableName: "attendance",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "출석 정보를 관리하는 테이블",
		}
	);
};
