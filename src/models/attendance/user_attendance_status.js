import UserModel from "../user/user.js";

/**
 * UserAttendanceStatus 모델
 * 사용자별 활동 유형에 따른 연속 출석/결석 상태를 관리하는 테이블
 * 
 * @description
 * - 주차별 연속 출석/결석 추적
 * - 활동 유형별 상태 관리
 * - 비활성화 여부 관리
 * 
 * @TODO 
 * - 연속 출석/결석 로직 자동 업데이트 기능 구현 필요
 * - 통계 및 리포트 기능 연계 필요
 */
export default (sequelize, Sequelize) => {
	const user = UserModel(sequelize, Sequelize);

	return sequelize.define(
		"UserAttendanceStatus",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "사용자 출석 상태 고유 식별자",
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
			activity_type: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "활동 유형 (예: 주일예배, 소그룹 등)",
			},
			one_week_attend: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "1주 연속 출석 여부",
			},
			two_week_attend: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "2주 연속 출석 여부",
			},
			three_week_attend: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "3주 연속 출석 여부",
			},
			over_four_week_attend: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "4주 이상 연속 출석 여부",
			},
			one_week_absence: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "1주 연속 결석 여부",
			},
			tho_week_absence: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "2주 연속 결석 여부",
			},
			three_week_absence: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "3주 연속 결석 여부",
			},
			over_four_week_absence: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "4주 이상 연속 결석 여부",
			},
			is_disabled: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "비활성화 여부",
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
			tableName: "user_attendance_status",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "사용자별 활동 유형에 따른 연속 출석/결석 상태를 관리하는 테이블",
		}
	);
};

