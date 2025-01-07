// File: UserHasChurchOffice.Model.js
// Created: 2024-03-19
// Description: 사용자-교회직분 연결 모델 정의

module.exports = (sequelize, Sequelize) => {
	const UserHasChurchOffice = sequelize.define(
		"UserHasChurchOffice",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "사용자-교회직분 연결 고유 식별자",
			},
			user_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "사용자 ID",
				references: {
					model: "user",
					key: "id",
				},
			},
			church_office_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "교회 직분 ID",
				references: {
					model: "church_office",
					key: "id",
				},
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
			tableName: "user_has_church_office",
			timestamps: false,
			comment: "사용자와 교회 직분 간의 관계를 관리하는 테이블",
		}
	)

	UserHasChurchOffice.associate = (models) => {
		UserHasChurchOffice.belongsTo(models.User, {
			foreignKey: "user_id",
			as: "User",
		})
		UserHasChurchOffice.belongsTo(models.ChurchOffice, {
			foreignKey: "church_office_id",
			as: "ChurchOffice",
		})
	}

	return UserHasChurchOffice
}
