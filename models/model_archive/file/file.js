export default (sequelize, Sequelize) => {
  return sequelize.define(
    "File",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "파일 고유 식별자",
      },
      file_for: {
        type: Sequelize.CHAR(2),
        allowNull: false,
        comment:
          "파일 용도 (예: 'CV' for curriculum vitae, 'PF' for profile photo 등)",
      },
      file_name: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "파일 이름",
      },
      file_title: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: "파일 제목",
      },
      file_description: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: "파일 설명",
      },
      file_path: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: "파일 경로, 파일을 식별할 수 있는 전체 경로",
      },
      file_size: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "파일 크기, 'KB', 'MB', 'GB' 단위 포함 문자열",
      },
      file_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: "파일 타입 (예: 'image/jpeg', 'application/pdf' 등)",
      },
      is_deleted: {
        type: Sequelize.CHAR(1),
        allowNull: false,
        defaultValue: "N",
        comment: "삭제 여부 (Y: 삭제됨, N: 활성 상태)",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "데이터 생성 일시",
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "데이터 최종 수정 일시",
      },
      creator_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "데이터를 생성한 사용자의 ID",
      },
      updater_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "데이터를 마지막으로 수정한 사용자의 ID",
      },
      creator_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "데이터를 생성한 사용자의 IP 주소",
      },
      updater_ip: {
        type: Sequelize.STRING(45),
        allowNull: false,
        comment: "데이터를 마지막으로 수정한 사용자의 IP 주소",
      },
      access_service_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "데이터 유입 채널",
      },
    },
    {
      tableName: "file",
      timestamps: false,
      comment: "파일 정보를 관리하는 테이블",
    }
  );
};
