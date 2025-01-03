const { sequelize } = require("../models/models");
const logger = require("./logger");

const initDatabase = async () => {
	try {
		await sequelize.authenticate();
		logger.info("데이터베이스 연결 성공");

		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
		await sequelize.sync({ force: false });
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

		logger.info("데이터베이스 동기화 완료");
	} catch (error) {
		logger.error("데이터베이스 초기화 실패", {
			error: error.message,
			stack: error.stack,
		});
		throw error; // 상위에서 처리하도록 에러 전파
	}
};

module.exports = {
	initDatabase,
};
