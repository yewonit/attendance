// File: ActivityStatistics.Model.js
// Created: 2023-08-07
// Description: 활동 통계 모델 정의

module.exports = (sequelize, Sequelize) => {
  const ActivityStatistics = sequelize.define(
    "ActivityStatistics",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "통계 데이터 고유 식별자",
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "관련 활동 ID",
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: "통계 날짜",
      },
      total_instances: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "총 인스턴스 수",
      },
      total_attendance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "총 출석 수",
      },
      average_attendance: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "평균 출석률",
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
      tableName: "activity_statistics",
      timestamps: false,
      comment: "활동 통계 정보를 관리하는 테이블",
    }
  );

  ActivityStatistics.associate = (models) => {
    ActivityStatistics.belongsTo(models.Activity, {
      foreignKey: "activity_id",
      as: "Activity",
    });
  };

  return ActivityStatistics;
};
