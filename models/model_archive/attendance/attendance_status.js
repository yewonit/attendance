export default (sequelize, Sequelize) => {
  return sequelize.define(
    "AttendanceStatus",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "출석 상태 고유 식별자",
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "상태명, 예: 출석, 결석, 지각, 조퇴",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "상태 설명",
      },
      is_counted_as_attended: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: "출석으로 인정 여부",
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
      tableName: "attendance_status",
      timestamps: true,
      createdAt: created_at,
      updatedAt: updated_at,
      comment: "출석 상태 정보를 관리하는 테이블",
    }
  );
};
