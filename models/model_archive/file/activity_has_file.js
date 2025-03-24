import ActivityModel from "../attendance/activity.js";
import FileModel from "./file.js";

export default (sequelize, Sequelize) => {
  const Activity = ActivityModel(sequelize, Sequelize)
  const File = FileModel(sequelize, Sequelize);

  return sequelize.define(
    "ActivityHasFile",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "활동-파일 연결 고유 식별자",
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "활동 ID, 관련 활동을 참조",
        references: {
          model: Activity,
          key: "id",
        },
      },
      file_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "파일 ID, 연결된 파일을 참조",
        references: {
          model: File,
          key: "id",
        },
      },
      is_deleted: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        defaultValue: "N",
        comment: "삭제 여부 (Y/N), 연결의 보이기/숨기기 상태 관리",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "데이터 생성 일시, 연결 생성 시각",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "데이터 최종 수정 일시, 마지막으로 연결 정보가 수정된 시각",
      },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "데이터를 생성한 사용자 ID, 연결 정보의 최초 생성자",
      },
      updater_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment:
          "데이터를 마지막으로 수정한 사용자 ID, 연결 정보의 최종 수정자",
      },
      creator_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "데이터를 생성한 사용자 IP 주소, 연결 정보 생성 시 사용된 IP",
      },
      updater_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment:
          "데이터를 마지막으로 수정한 사용자 IP 주소, 연결 정보 수정 시 사용된 IP",
      },
      access_service_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "데이터 유입 채널, 연결 정보가 입력되거나 수정된 경로 정보",
      },
    },
    {
      tableName: "activity_has_file",
      timestamps: true,
      createdAt: created_at,
      updatedAt: updated_at,
      comment: "활동과 파일 간의 관계를 관리하는 테이블",
    }
  );
};
