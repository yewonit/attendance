import UserModel from "../user/user.js";
import RoleModel from "./role.js";
import OrganizationModel from "../organization/organization.js";

export default (sequelize, Sequelize) => {
  const User = UserModel(sequelize, Sequelize);
  const Role = RoleModel(sequelize, Sequelize);
  const Organization = OrganizationModel(sequelize, Sequelize);

  return sequelize.define(
    "UserHasRole",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "역할 할당 고유 식별자",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "할당된 사용자 ID, 사용자 테이블의 ID를 참조",
        references: {
          model: User,
          key: "id",
        },
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "할당된 역할 ID, 역할 테이블의 ID를 참조",
        references: {
          model: Role,
          key: "id",
        },
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "역할이 속한 조직 ID, 조직 테이블의 ID를 참조",
        references: {
          model: Organization,
          key: "id",
        },
      },
      organization_code: {
        type: Sequelize.STRING(30),
        allowNull: false,
        comment:
          "역할이 속한 조직 코드, 조직 테이블의 organization_code를 참조",
      },
      role_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "역할 시작 날짜",
      },
      role_end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: "역할 종료 날짜",
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
      tableName: "user_has_role",
      timestamps: false,
      comment: "사용자와 역할 간의 관계를 관리하는 테이블",
    }
  );
};
