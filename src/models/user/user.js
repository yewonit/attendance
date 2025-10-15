export default (sequelize, Sequelize) => {
	return sequelize.define(
		"User",
		{
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				comment: "사용자 고유 식별자",
			},
			name: {
				type: Sequelize.STRING(50),
				allowNull: false,
				comment: "사용자 이름",
			},
			name_suffix: {
				type: Sequelize.STRING(10),
				allowNull: false,
				comment: "동명이인 구분자 (e.g. 이장훈A의 A)",
			},
			email: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "사용자 이메일 주소",
			},
			password: {
				type: Sequelize.TEXT,
				allowNull: true,
				comment: "사용자 비밀번호 (암호화됨)",
			},
			gender: {
				type: Sequelize.CHAR(1),
				allowNull: true,
				comment: "성별",
			},
			birth_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
				comment: "생년월일",
			},
			phone_number: {
				type: Sequelize.STRING(20),
				allowNull: false,
				comment: "전화번호",
			},
			is_new_member: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "새가족 여부",
			},
			is_long_term_absentee: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "장결자 여부",
			},
			is_deleted: {
				type: Sequelize.BOOLEAN,
				allowNull: false,
				defaultValue: false,
				comment: "삭제 여부",
			},
			registration_date: {
				type: Sequelize.DATE,
				allowNull: true,
				defaultValue: Sequelize.NOW,
				comment: "등록일",
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
				comment: "데이터 수정 일시",
			},
		},
		{
			tableName: "user",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "유저",
		}
	);
};
