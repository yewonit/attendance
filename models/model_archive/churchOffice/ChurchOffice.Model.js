// File: ChurchOffice.Model.js
// Created: 2024-03-19
// Description: 교회 직분 모델 정의

module.exports = (sequelize, Sequelize) => {
	const ChurchOffice = sequelize.define(
		"ChurchOffice",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "교회 직분 고유 식별자",
			},
			church_office_name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "교회 직분명 (예: 장로, 권사, 집사 등)",
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
			tableName: "church_office",
			timestamps: false,
			comment: "교회 직분 정보를 관리하는 테이블",
		}
	)

	// 필요한 경우 관계 설정을 위한 associate 메서드 추가
	ChurchOffice.associate = (models) => {
		// 예시: User와의 관계 설정이 필요한 경우
		// ChurchOffice.hasMany(models.User, {
		//   foreignKey: "church_office_id",
		//   as: "Users",
		// });
	}

	return ChurchOffice
}
