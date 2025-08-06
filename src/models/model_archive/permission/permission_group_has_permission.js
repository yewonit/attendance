import PermissionModel from "./permissions.js";
import PermissionGroupModel from "./permission_group.js";

export default (sequelize, Sequelize) => {
	const Permission = PermissionModel(sequelize, Sequelize);
	const PermissionGroup = PermissionGroupModel(sequelize, Sequelize);

	return sequelize.define(
		"PermissionGroupHasPermissions",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "권한 고유 식별자",
			},
			permission_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "연관된 권한 id",
				references: {
					model: Permission,
					key: "id",
				},
			},
			permission_group_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "연관된 권한 그룹 id",
				references: {
					model: PermissionGroup,
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
			tableName: "permission_group_has_permissions",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "권한 그룹과 권한 연관 테이블",
		}
	);
};
