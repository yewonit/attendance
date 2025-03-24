export default (sequelize, Sequelize) => {
	return sequelize.define(
		"Activity",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "활동 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(100),
				allowNull: false,
				comment: "활동 명칭, 예: 주일1부예배, 원네스 모임",
			},
			description: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "활동 상세 설명",
			},
			activity_category_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "활동 카테고리 ID",
			},
			organization_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "주최 조직 ID",
			},
			is_recurring: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "반복 여부",
			},
			location_type: {
				type: Sequelize.ENUM("OFFLINE", "ONLINE", "HYBRID"),
				allowNull: false,
				comment: "활동 장소 유형",
			},
			location: {
				type: Sequelize.STRING(100),
				allowNull: true,
				comment: "활동 장소 (오프라인인 경우)",
			},
			online_link: {
				type: Sequelize.STRING(255),
				allowNull: true,
				comment: "온라인 링크 (온라인 또는 하이브리드인 경우)",
			},
			default_start_time: {
				type: Sequelize.TIME,
				allowNull: false,
				comment: "기본 시작 시간",
			},
			default_end_time: {
				type: Sequelize.TIME,
				allowNull: false,
				comment: "기본 종료 시간",
			},
			is_deleted: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "삭제 여부 (Y/N)",
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
			creator_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "생성자 ID",
			},
			updater_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "수정자 ID",
			},
			creator_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "생성자 IP 주소",
			},
			updater_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "수정자 IP 주소",
			},
			access_service_id: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "접근 서비스 ID",
			},
		},
		{
			tableName: "activity",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "활동 정보를 관리하는 테이블",
		}
	);
};
