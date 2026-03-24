import UserModel from "../user/user.js";
import RoleModel from "./role.js";
import OrganizationModel from "../organization/organization.js";

export default (sequelize, Sequelize) => {
	const user = UserModel(sequelize, Sequelize);
	const role = RoleModel(sequelize, Sequelize);
	const organization = OrganizationModel(sequelize, Sequelize);

	return sequelize.define(
		"UserRole",
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
					model: user,
					key: "id",
				},
			},
			role_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "할당된 역할 ID, 역할 테이블의 ID를 참조",
				references: {
					model: role,
					key: "id",
				},
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "역할이 속한 조직 ID, 조직 테이블의 ID를 참조",
				references: {
					model: organization,
					key: "id",
				},
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
		},
		{
			tableName: "user_role",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "직분",
		}
	);
};
