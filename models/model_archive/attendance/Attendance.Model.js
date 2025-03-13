// File: Attendance.Model.js
// Created: 2023-08-07
// Description: 출석 모델 정의

export default (sequelize, Sequelize) => {
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
      },
      activity_instance_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "활동 인스턴스 ID",
      },
      attendance_status_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "출석 상태 ID",
      },
      check_in_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "입실 시간",
      },
      check_out_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "퇴실 시간",
      },
      attendance_role: {
        type: Sequelize.ENUM("PARTICIPANT", "LEADER", "ASSISTANT"),
        allowNull: false,
        comment: "참석 역할",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "특이사항 등 메모",
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
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "생성자 ID",
      },
      updater_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "수정자 ID",
      },
    },
    {
      tableName: "attendance",
      timestamps: false,
      comment: "출석 정보를 관리하는 테이블",
    }
  );
};
