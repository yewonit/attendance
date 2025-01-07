module.exports = (sequelize, Sequelize) => {
	return sequelize.define(
		"Visitation",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "심방 고유 식별자",
			},
			visitor_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "심방자 ID, 심방을 수행한 직분자의 사용자 ID",
				references: {
					model: "user",
					key: "id",
				},
			},
			visitee_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "피심방자 ID, 심방을 받은 사용자 ID",
				references: {
					model: "user",
					key: "id",
				},
			},
			visitation_date: {
				type: Sequelize.DATEONLY,
				allowNull: false,
				comment: "심방 날짜",
			},
			visitation_content: {
				type: Sequelize.TEXT,
				allowNull: false,
				comment: "심방 내용",
			},
			is_deleted: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "삭제 여부 (Y/N)",
			},
			created_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
				comment: "데이터 생성 일시",
			},
			updated_at: {
				type: Sequelize.DATE,
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
			tableName: "visitation",
			timestamps: false,
			comment: "심방 정보를 관리하는 테이블",
		}
	);
};
