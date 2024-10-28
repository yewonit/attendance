"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("activity_child");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "activity_child",
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: "엑티비티 차일드 고유 식별자",
        },
        activity_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "관련 엑티비티 ID, 상위 엑티비티를 참조",
          references: {
            model: "activity",
            key: "id",
          },
        },
        activity_date: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: "활동 실행 날짜, 실제 활동이 이루어진 날",
        },
        start_time: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: "활동 시작 시간, 실제 활동이 시작된 시각",
        },
        end_time: {
          type: Sequelize.DATE,
          allowNull: false,
          comment: "활동 종료 시간, 실제 활동이 종료된 시각",
        },
        session_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "회차 정보, 예: 1회차, 2회차 등",
        },
        attendance: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "참여 인원수, 실제 활동에 참여한 인원 수",
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "활동에 대한 추가적인 메모나 설명",
        },
        is_deleted: {
          type: Sequelize.CHAR(1),
          allowNull: false,
          defaultValue: "N",
          comment: "삭제 여부 (Y/N), 엑티비티 차일드의 보이기/숨기기 상태 관리",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 생성 일시, 엑티비티 차일드 생성 시각",
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment:
            "데이터 최종 수정 일시, 마지막으로 엑티비티 차일드 정보가 수정된 시각",
        },
        creator_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 ID, 엑티비티 차일드 정보의 최초 생성자",
        },
        updater_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 ID, 엑티비티 차일드 정보의 최종 수정자",
        },
        creator_ip: {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 IP 주소, 엑티비티 차일드 정보 생성 시 사용된 IP",
        },
        updater_ip: {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 IP 주소, 엑티비티 차일드 정보 수정 시 사용된 IP",
        },
        access_service_id: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment:
            "데이터 유입 채널, 엑티비티 차일드 정보가 입력되거나 수정된 경로 정보",
        },
      },
      {
        comment: "활동의 구체적인 실행 인스턴스 정보를 관리하는 테이블",
      }
    );

    // 인덱스 추가
    await queryInterface.addIndex("activity_child", ["activity_id"]);
    await queryInterface.addIndex("activity_child", ["activity_date"]);
    await queryInterface.addIndex("activity_child", ["start_time"]);
    await queryInterface.addIndex("activity_child", ["end_time"]);
    await queryInterface.addIndex("activity_child", ["is_deleted"]);
  },
};
