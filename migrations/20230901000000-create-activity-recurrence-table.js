"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "activity_recurrence",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: "반복 패턴 고유 식별자",
        },
        activity_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "관련 활동 ID",
          references: {
            model: "activity",
            key: "id",
          },
        },
        recurrence_type: {
          type: Sequelize.ENUM("DAILY", "WEEKLY", "MONTHLY", "YEARLY"),
          allowNull: false,
          comment: "반복 유형",
        },
        interval: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "반복 간격, 예: 1주일마다, 2주일마다",
        },
        day_of_week: {
          type: Sequelize.SET("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"),
          allowNull: true,
          comment: "주간 반복 시 요일",
        },
        day_of_month: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "월간 반복 시 날짜",
        },
        month_of_year: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "연간 반복 시 월",
        },
        start_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: "반복 시작 날짜",
        },
        end_date: {
          type: Sequelize.DATEONLY,
          allowNull: true,
          comment: "반복 종료 날짜 (선택적)",
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
        comment: "활동 반복 패턴 정보를 관리하는 테이블",
      }
    );

    // 인덱스 추가
    await queryInterface.addIndex("activity_recurrence", ["activity_id"]);
    await queryInterface.addIndex("activity_recurrence", ["recurrence_type"]);
    await queryInterface.addIndex("activity_recurrence", ["start_date"]);
    await queryInterface.addIndex("activity_recurrence", ["end_date"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("activity_recurrence");
  },
};
