"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 새로운 컬럼 추가
      await queryInterface.addColumn(
        "activity",
        "is_recurring",
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          comment: "반복 여부",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "activity",
        "location_type",
        {
          type: Sequelize.ENUM("OFFLINE", "ONLINE", "HYBRID"),
          allowNull: false,
          defaultValue: "OFFLINE",
          comment: "활동 장소 유형",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "activity",
        "online_link",
        {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "온라인 링크 (온라인 또는 하이브리드인 경우)",
        },
        { transaction }
      );

      // 2. 컬럼 이름 변경
      await queryInterface.renameColumn(
        "activity",
        "start_time",
        "default_start_time",
        { transaction }
      );
      await queryInterface.renameColumn(
        "activity",
        "end_time",
        "default_end_time",
        { transaction }
      );

      // 3. 불필요한 컬럼 제거
      await queryInterface.removeColumn("activity", "organizer_type", {
        transaction,
      });
      await queryInterface.removeColumn("activity", "organizer_name", {
        transaction,
      });
      await queryInterface.removeColumn("activity", "purpose", { transaction });
      await queryInterface.removeColumn("activity", "participants", {
        transaction,
      });

      // 4. 컬럼 속성 변경
      await queryInterface.changeColumn(
        "activity",
        "location",
        {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: "활동 장소 (오프라인인 경우)",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "name",
        {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "활동 명칭, 예: 주일1부예배, 원네스 모임",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "description",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "활동 상세 설명",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "activity_category_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "활동 카테고리 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "organization_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "주최 조직 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
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
        "activity",
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
        "activity",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "생성자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "수정자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "creator_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment: "생성자 IP 주소",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "updater_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment: "수정자 IP 주소",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "access_service_id",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "접근 서비스 ID",
        },
        { transaction }
      );

      // 5. 테이블 코멘트 업데이트
      await queryInterface.changeTable(
        "activity",
        {
          comment: "활동 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 추가된 컬럼 제거
      await queryInterface.removeColumn("activity", "is_recurring", {
        transaction,
      });
      await queryInterface.removeColumn("activity", "location_type", {
        transaction,
      });
      await queryInterface.removeColumn("activity", "online_link", {
        transaction,
      });

      // 2. 컬럼 이름 원복
      await queryInterface.renameColumn(
        "activity",
        "default_start_time",
        "start_time",
        { transaction }
      );
      await queryInterface.renameColumn(
        "activity",
        "default_end_time",
        "end_time",
        { transaction }
      );

      // 3. 제거된 컬럼 다시 추가
      await queryInterface.addColumn(
        "activity",
        "organizer_type",
        {
          type: Sequelize.CHAR(1),
          allowNull: false,
          comment: "주최자 유형, 'B'는 본부, 'C'는 교회, 'O'는 기타를 의미",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "activity",
        "organizer_name",
        {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "주최자 이름, 활동을 주최하는 개인 또는 조직의 이름",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "activity",
        "purpose",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "활동 목적, 활동을 통해 달성하고자 하는 목표나 이유",
        },
        { transaction }
      );

      await queryInterface.addColumn(
        "activity",
        "participants",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "예상 참여 인원수, 활동에 참여할 것으로 예상되는 인원",
        },
        { transaction }
      );

      // 4. 컬럼 속성 원복
      await queryInterface.changeColumn(
        "activity",
        "location",
        {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "활동이 이루어지는 장소, 구체적인 위치 정보 포함",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "name",
        {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "활동의 명칭, 활동을 구분할 수 있는 유니크한 이름",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "description",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment:
            "활동에 대한 상세 설명, 활동의 내용, 목적, 기대 효과 등을 포함",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "activity_category_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "활동 카테고리 ID, 활동이 속하는 카테고리를 참조 (activity_category 테이블 참조)",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "organization_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "활동의 주최 조직 ID, 활동을 주최하는 조직을 식별 (organization 테이블 참조)",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "created_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 생성 일시, 활동 생성 시각",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "updated_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 최종 수정 일시, 마지막으로 활동 정보가 수정된 시각",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "데이터를 생성한 사용자 ID, 활동 정보의 최초 생성자",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 ID, 활동 정보의 최종 수정자",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "creator_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 IP 주소, 활동 정보 생성 시 사용된 IP",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "updater_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 IP 주소, 활동 정보 수정 시 사용된 IP",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity",
        "access_service_id",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "데이터 유입 채널, 활동 정보가 입력되거나 수정된 경로 정보",
        },
        { transaction }
      );

      // 5. 테이블 코멘트 원복
      await queryInterface.changeTable(
        "activity",
        {
          comment:
            "활동을 분류하고 구분하기 위한 카테고리 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },
};
