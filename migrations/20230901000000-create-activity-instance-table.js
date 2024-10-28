"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "activity_instance",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: "활동 인스턴스 고유 식별자",
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
        parent_instance_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "상위 인스턴스 ID (복합 활동의 경우)",
          references: {
            model: "activity_instance",
            key: "id",
          },
        },
        start_datetime: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: "실제 시작 일시",
        },
        end_datetime: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: "실제 종료 일시",
        },
        actual_location: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: "실제 장소 (변경된 경우)",
        },
        actual_online_link: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "실제 온라인 링크 (변경된 경우)",
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "특이사항 등 메모",
        },
        attendance_count: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "참석자 수",
        },
        is_canceled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "취소 여부",
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
          references: {
            model: "user",
            key: "id",
          },
        },
        updater_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "수정자 ID",
          references: {
            model: "user",
            key: "id",
          },
        },
      },
      {
        comment: "활동 인스턴스 정보를 관리하는 테이블",
      }
    );

    // 인덱스 추가
    await queryInterface.addIndex("activity_instance", ["activity_id"]);
    await queryInterface.addIndex("activity_instance", ["parent_instance_id"]);
    await queryInterface.addIndex("activity_instance", ["start_datetime"]);
    await queryInterface.addIndex("activity_instance", ["end_datetime"]);
    await queryInterface.addIndex("activity_instance", ["is_canceled"]);
    await queryInterface.addIndex("activity_instance", ["creator_id"]);
    await queryInterface.addIndex("activity_instance", ["updater_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("activity_instance");
  },
};
