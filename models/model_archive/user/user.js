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
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "사용자 이름",
			},
			name_suffix: {
				type: Sequelize.CHAR(7),
				allowNull: true,
				comment: "동명이인 구분자",
			},
			email: {
				type: Sequelize.STRING(225),
				allowNull: true,
				comment: "사용자 이메일 주소",
			},
			password: {
				type: Sequelize.CHAR(125),
				allowNull: true,
				comment: "사용자 비밀번호 (암호화됨)",
			},
			gender_type: {
				type: Sequelize.CHAR(1),
				allowNull: true,
				comment: "성별 타입 (M, F 등)",
			},
			birth_date: {
				type: Sequelize.DATEONLY,
				allowNull: true,
				comment: "생년월일",
			},
			address: {
				type: Sequelize.STRING(100),
				allowNull: true,
				comment: "주소 라인 1",
			},
			address_detail: {
				type: Sequelize.STRING(100),
				allowNull: true,
				comment: "추가된 주소 라인 2",
			},
			city: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "도시 이름",
			},
			state_province: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "주 또는 도 이름",
			},
			country: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "국가 이름",
			},
			zip_postal_code: {
				type: Sequelize.STRING(20),
				allowNull: true,
				comment: "우편번호",
			},
			is_address_public: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "주소 공개 여부",
			},
			sns_url: {
				type: Sequelize.STRING(225),
				allowNull: true,
				comment: "SNS URL",
			},
			hobby: {
				type: Sequelize.STRING(45),
				allowNull: true,
				comment: "취미",
			},
			phone_number: {
				type: Sequelize.STRING(20),
				allowNull: true,
				comment: "전화번호 (국제 전화번호 형식 고려)",
			},
			is_phone_number_public: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "전화번호 공개 여부",
			},
			church_member_number: {
				type: Sequelize.STRING(10),
				allowNull: true,
				comment: "교회 회원 번호",
			},
			church_registration_date: {
				type: Sequelize.DATE,
				allowNull: true,
				comment: "교회 등록 일시",
			},
			is_new_member: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "신규 회원 여부 (Y/N)",
			},
			is_long_term_absentee: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "장기 결석자 여부 (Y/N)",
			},
			is_kakaotalk_chat_member: {
				type: Sequelize.CHAR(1),
				allowNull: false,
				defaultValue: "N",
				comment: "카카오톡 채팅방 회원 여부 (Y/N)",
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
				comment: "데이터 생성 일시",
			},
			updated_at: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.NOW,
				comment: "데이터 수정 일시",
			},
			creator_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "데이터 생성자 ID",
			},
			updater_id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				comment: "데이터 수정자 ID",
			},
			creator_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "데이터 생성자 IP 주소",
			},
			updater_ip: {
				type: Sequelize.STRING(45),
				allowNull: false,
				comment: "데이터 수정자 IP 주소",
			},
			access_service_id: {
				type: Sequelize.STRING(50),
				allowNull: true,
				comment: "유입 채널",
			},
		},
		{
			tableName: "user",
			timestamps: true,
			createdAt: "created_at",
			updatedAt: "updated_at",
			comment: "사용자 정보를 관리하는 테이블",
		}
	);
};
