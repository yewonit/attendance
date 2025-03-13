// File: Service.Model.js
// Created: 2024-03-19
// Description: 서비스 모델 정의

export default (sequelize, Sequelize) => {
	const Service = sequelize.define(
		"Service",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "서비스 고유 식별자",
			},
			service_name: {
				type: Sequelize.STRING(100),
				allowNull: false,
				comment: "서비스 이름",
			},
			service_description: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "서비스 상세 설명",
			},
			service_type: {
				type: Sequelize.STRING(50),
				allowNull: false,
				comment: "서비스 유형",
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "소속 조직 ID",
				references: {
					model: "organization",
					key: "id",
				},
			},
			active_status: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "Y",
				comment: "활성화 상태 (Y: 활���, N: 비활성)",
			},
			start_date: {
				type: Sequelize.DATEONLY,
				allowNull: false,
				comment: "서비스 시작일",
			},
			end_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
				comment: "서비스 종료일",
			},
			related_tables: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "관련 테이블 목록",
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
			tableName: "service",
			timestamps: false,
			comment: "서비스 정보를 관리하는 테이블",
		}
	)

	Service.associate = (models) => {
		Service.belongsTo(models.Organization, {
			foreignKey: "organization_id",
			as: "Organization",
		})
	}

	return Service
}
