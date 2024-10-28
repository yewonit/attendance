// File: ActivityRecurrence.Model.js
// Created: 2023-08-07
// Description: 활동 반복 패턴 모델 정의

module.exports = (sequelize, Sequelize) => {
  const ActivityRecurrence = sequelize.define(
    "ActivityRecurrence",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "활동 반복 고유 식별자",
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "활동 ID",
      },
      recurrence_type: {
        type: Sequelize.ENUM("DAILY", "WEEKLY", "MONTHLY", "YEARLY"),
        allowNull: false,
        comment: "반복 유형",
      },
      recurrence_interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "반복 간격",
      },
      recurrence_days: {
        type: Sequelize.STRING, // SET 대신 STRING 사용
        allowNull: true,
        comment: "반복 요일 (주간 반복인 경우)",
        get() {
          const rawValue = this.getDataValue("recurrence_days");
          return rawValue ? rawValue.split(",") : [];
        },
        set(val) {
          if (Array.isArray(val)) {
            this.setDataValue("recurrence_days", val.join(","));
          } else {
            this.setDataValue("recurrence_days", val);
          }
        },
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
      tableName: "activity_recurrence",
      timestamps: false,
      comment: "활동 반복 패턴 정보를 관리하는 테이블",
    }
  );

  ActivityRecurrence.associate = (models) => {
    ActivityRecurrence.belongsTo(models.Activity, {
      foreignKey: "activity_id",
      as: "Activity",
    });
  };

  return ActivityRecurrence;
};
