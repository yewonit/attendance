import RoleModel from "../role/role.js";
import PermissionModel from "./permission.js";

export default (sequelize, Sequelize) => {
	const role = RoleModel(sequelize, Sequelize);
	const permission = PermissionModel(sequelize, Sequelize);

	return sequelize.define(
		"RolePermission",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "역할 권한 고유 식별자",
			},
			role_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "역할 ID, 역할 테이블의 ID를 참조",
				references: {
					model: role,
					key: "id",
				},
			},
			permission_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "권한 ID, 권한 테이블의 ID를 참조",
				references: {
					model: permission,
					key: "id",
				},
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
			tableName: "role_permission",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "역할 권한 테이블",
		}
	);
};
