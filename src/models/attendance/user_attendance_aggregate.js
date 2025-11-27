import UserModel from "../user/user.js";

/**
 * UserAttendanceAggregate 모델
 * 사용자별 활동 유형에 따른 출석/결석 통계 및 상태를 관리하는 테이블
 * 
 * @description
 * - 연속 출석/결석 횟수 추적
 * - 최대 연속 출석/결석 횟수 기록
 * - 총 출석/결석 횟수 관리
 * - 활동 유형별 상태 관리
 * - 비활성화 여부 관리
 */
export default (sequelize, Sequelize) => {
	const user = UserModel(sequelize, Sequelize);

	return sequelize.define(
		"UserAttendanceAggregate",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "사용자 출석 집계 고유 식별자",
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
			attendance_continuous_count: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
				comment: "연속 출석 횟수",
			},
			absence_continuous_count: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
				comment: "연속 결석 횟수",
			},
			total_attend_count: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
				comment: "총 출석 횟수",
			},
			total_absence_count: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 0,
				comment: "총 결석 횟수",
			},
			last_action: {
				type: Sequelize.STRING(10),
				allowNull: true,
				comment: "마지막 행동 (출석/결석)",
			},
			last_opposite_continuous_count: {
				type: Sequelize.INTEGER,
				allowNull: true,
				comment: "마지막 반대 연속 횟수",
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
			tableName: "user_attendance_aggregate",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "사용자별 활동 유형에 따른 출석/결석 통계 및 상태를 관리하는 테이블",
		}
	);
};

