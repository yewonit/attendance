import OrganizationModel from "../organization/organization.js";
import PermissionGroupModel from "../permission/permission_group.js";

export default (sequelize, Sequelize) => {
	const Organization = OrganizationModel(sequelize, Sequelize);
	const PermissionGroup = PermissionGroupModel(sequelize, Sequelize);

	return sequelize.define(
		"Role",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "역할 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "역할 이름",
			},
			is_deleted: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
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
		},
		{
			tableName: "role",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "역할 정보를 관리하는 테이블",
		}
	);
};
