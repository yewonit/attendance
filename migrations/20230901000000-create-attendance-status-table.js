"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "attendance_status",
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
        comment: "출석 상태 정보를 관리하는 테이블",
      }
    );

    // 인덱스 추가
    await queryInterface.addIndex("attendance_status", ["name"], {
      unique: true,
    });
    await queryInterface.addIndex("attendance_status", [
      "is_counted_as_attended",
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("attendance_status");
  },
};
