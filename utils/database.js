import { Sequelize } from "sequelize";
import env from "../config/environment.js";
import logger from "./logger.js";

// 📚 데이터베이스 연결 설정
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
	host: env.DB_HOST,
	dialect: "mysql",
	logging: false,
});

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

export { initDatabase, sequelize };
