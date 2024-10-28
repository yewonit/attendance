"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 새로운 컬럼 추가
      await queryInterface.addColumn(
        "activity_category",
        "parent_id",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: "상위 카테고리 ID, 계층 구조 표현을 위함",
          references: {
            model: "activity_category",
            key: "id",
          },
        },
        { transaction }
      );

      // 2. 불필요한 컬럼 제거
      await queryInterface.removeColumn(
        "activity_category",
        "activityCategory",
        { transaction }
      );

      // 3. 코멘트 업데이트
      await queryInterface.changeColumn(
        "activity_category",
        "name",
        {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "활동 카테고리 이름, 예: 예배, 모임",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "description",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "활동 카테고리 설명",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "is_deleted",
        {
          type: Sequelize.CHAR(1),
          allowNull: false,
          defaultValue: "N",
          comment: "삭제 여부 (Y/N)",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
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
        "activity_category",
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
        "activity_category",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "생성자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "수정자 ID",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "creator_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment: "생성자 IP 주소",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "updater_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment: "수정자 IP 주소",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "access_service_id",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "접근 서비스 ID",
        },
        { transaction }
      );

      // 4. 테이블 코멘트 업데이트
      await queryInterface.changeTable(
        "activity_category",
        {
          comment: "활동 카테고리 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 추가된 컬럼 제거
      await queryInterface.removeColumn("activity_category", "parent_id", {
        transaction,
      });

      // 2. 제거된 컬럼 다시 추가
      await queryInterface.addColumn(
        "activity_category",
        "activityCategory",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "활동 카테고리, 활동의 다양한 성격이나 목적을 구분",
        },
        { transaction }
      );

      // 3. 코멘트 원래대로 되돌리기
      await queryInterface.changeColumn(
        "activity_category",
        "name",
        {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: "활동 카테고리 이름, 활동을 구분하는 직관적 명칭",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "description",
        {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: "활동 카테고리 설명, 카테고리의 세부 사항 및 목적 설명",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "is_deleted",
        {
          type: Sequelize.CHAR(1),
          allowNull: false,
          defaultValue: "N",
          comment: "삭제 여부 (Y/N), 활동 카테고리의 보이기/숨기기 상태 관리",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "created_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 생성 일시, 활동 카테고리가 언제 생성되었는지 추적",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "updated_at",
        {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
          comment: "데이터 최종 수정 일시, 활동 카테고리 수정 기록",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "creator_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 ID, 활동 카테고리의 최초 생성자 정보",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "updater_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 ID, 활동 카테고리의 수정자 정보",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "creator_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 생성한 사용자 IP 주소, 사용자 위치 및 보안 감사를 위한 정보",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "updater_ip",
        {
          type: Sequelize.STRING(45),
          allowNull: false,
          comment:
            "데이터를 마지막으로 수정한 사용자 IP 주소, 보안 감사와 추적을 위한 정보",
        },
        { transaction }
      );

      await queryInterface.changeColumn(
        "activity_category",
        "access_service_id",
        {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: "데이터 유입 채널, 활동 카테고리 형성 경로 정보",
        },
        { transaction }
      );

      // 4. 테이블 코멘트 원래대로 되돌리기
      await queryInterface.changeTable(
        "activity_category",
        {
          comment:
            "활동을 분류하고 구분하기 위한 카테고리 정보를 관리하는 테이블",
        },
        { transaction }
      );
    });
  },
};
