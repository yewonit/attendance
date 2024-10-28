"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 새로운 컬럼 추가
      await queryInterface.addColumn(
        "attendance",
        "attendance_status_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "출석 상태 ID",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "check_in_time",
        {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "입실 시간",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "check_out_time",
        {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "퇴실 시간",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "attendance_role",
        {
          type: Sequelize.ENUM("PARTICIPANT", "LEADER", "ASSISTANT"),
          allowNull: false,
          comment: "참석 역할",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "notes",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "특이사항 등 메모",
        },
        { transaction }
      );

      // 2. 컬럼 이름 변경
      await queryInterface.renameColumn(
        "attendance",
        "activity_child_id",
        "activity_instance_id",
        { transaction }
      );

      // 3. 불필요한 컬럼 제거
      await queryInterface.removeColumn("attendance", "activity_id", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "is_deleted", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "creator_ip", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "updater_ip", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "access_service_id", {
        transaction,
      });

      // 4. 컬럼 속성 변경 및 코멘트 업데이트
      await queryInterface.changeColumn(
        "attendance",
        "id",
        {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: "출석 기록 고유 식별자",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "user_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "사용자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "activity_instance_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "활동 인스턴스 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "created_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "생성 일시",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "updated_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "수정 일시",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "생성자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "수정자 ID",
        },
        { transaction }
      );

      // 5. 테이블 코멘트 업데이트
      await queryInterface.changeTable(
        "attendance",
        {
          comment: "출석 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 추가된 컬럼 제거
      await queryInterface.removeColumn("attendance", "attendance_status_id", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "check_in_time", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "check_out_time", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "attendance_role", {
        transaction,
      });
      await queryInterface.removeColumn("attendance", "notes", { transaction });

      // 2. 컬럼 이름 원복
      await queryInterface.renameColumn(
        "attendance",
        "activity_instance_id",
        "activity_child_id",
        { transaction }
      );

      // 3. 제거된 컬럼 다시 추가
      await queryInterface.addColumn(
        "attendance",
        "activity_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "활동 ID, 관련 활동을 참조",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "is_deleted",
        {
          type: Sequelize.CHAR(1),
          allowNull: false,
          defaultValue: "N",
          comment: "삭제 여부 (Y/N), 출결 기록의 보이기/숨기기 상태 관리",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "creator_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 IP 주소, 출결 기록 생성 시 사용된 IP",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "updater_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 IP 주소, 출결 기록 수정 시 사용된 IP",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "attendance",
        "access_service_id",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "데이터 유입 채널, 출결 기록이 입력되거나 수정된 경로 정보",
        },
        { transaction }
      );

      // 4. 컬럼 속성 및 코멘트 원복
      await queryInterface.changeColumn(
        "attendance",
        "id",
        {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: "출결 고유 식별자",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "user_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "사용자 ID, 출결 기록 대상 사용자를 식별",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "activity_child_id",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "엑티비티 차일드 ID, 구체적인 활동 인스턴스를 참조",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "created_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 생성 일시, 출결 기록 생성 시각",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "updated_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 최종 수정 일시, 마지막으로 출결 기록이 수정된 시각",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "데이터를 생성한 사용자 ID, 출결 기록의 최초 생성자",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "attendance",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 ID, 출결 기록의 최종 수정자",
        },
        { transaction }
      );

      // 5. 테이블 코멘트 원복
      await queryInterface.changeTable(
        "attendance",
        {
          comment: "활동에 대한 사용자의 출결 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },
};
