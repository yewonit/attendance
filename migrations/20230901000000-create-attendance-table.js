"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "attendance",
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
            model: "user",
            key: "id",
          },
        },
        activity_instance_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "활동 인스턴스 ID",
          references: {
            model: "activity_instance",
            key: "id",
          },
        },
        attendance_status_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "출석 상태 ID",
          references: {
            model: "attendance_status",
            key: "id",
          },
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
        comment: "출석 정보를 관리하는 테이블",
      }
    );

    // 인덱스 추가
    await queryInterface.addIndex("attendance", ["user_id"]);
    await queryInterface.addIndex("attendance", ["activity_instance_id"]);
    await queryInterface.addIndex("attendance", ["attendance_status_id"]);
    await queryInterface.addIndex("attendance", ["creator_id"]);
    await queryInterface.addIndex("attendance", ["updater_id"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("attendance");
  },
};
