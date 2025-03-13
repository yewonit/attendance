export default (sequelize, Sequelize) => {
	return sequelize.define(
		"Organization",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "조직 고유 식별자",
			},
			season_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				comment: "회기 ID",
			},
			organization_code: {
				type: Sequelize.STRING(30),
				allowNull: false,
				comment: "조직의 고유 코드. 조직의 연속성 추적에 사용",
			},
			organization_name: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "조직 이름",
			},
			organization_description: {
				type: Sequelize.STRING(100),
				allowNull: true,
				comment: "조직에 대한 설명",
			},
			upper_organization_id: {
				type: Sequelize.INTEGER,
				allowNull: true,
				comment: "상위 조직 아이디, 조직간 계층구조를 나타냄",
			},
			start_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
				comment: "세션 시작 날짜",
			},
			end_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
				comment: "세션 종료 날짜",
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
			tableName: "organization",
			timestamps: false,
			comment: "조직 정보를 관리하는 테이블",
		}
	)
}
