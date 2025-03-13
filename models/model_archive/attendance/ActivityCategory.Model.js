// File: ActivityCategory.Model.js
// Created: 2023-08-07
// Description: 활동 카테고리 모델 정의

export default (sequelize, Sequelize) => {
  return sequelize.define(
    "ActivityCategory",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "활동 카테고리 고유 식별자",
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "활동 카테고리 이름, 예: 예배, 모임",
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "활동 카테고리 설명",
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "상위 카테고리 ID, 계층 구조 표현을 위함",
      },
      is_deleted: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        defaultValue: "N",
        comment: "삭제 여부 (Y/N)",
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
      creator_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "생성자 IP 주소",
      },
      updater_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "수정자 IP 주소",
      },
      access_service_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "접근 서비스 ID",
      },
    },
    {
      tableName: "activity_category",
      timestamps: false,
      comment: "활동 카테고리 정보를 관리하는 테이블",
    }
  );
};
