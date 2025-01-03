const express = require("express");
const compression = require("compression");
const cors = require("cors");
const logger = require("./utils/logger");
const {
	requestLogger,
	errorLogger,
	setupGlobalLogging,
} = require("./middleware/logging");
const { NotFoundError } = require("./utils/errors");
const router = require("./router");
const bodyParser = require("body-parser");
const { initDatabase } = require("./utils/database");

const app = express();

// bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// compression: 데이터 압축
app.use(compression());

// cors: 크로스오리진 지원, 모든 출처 허용 설정
app.use(cors());

// 로깅 미들웨어 추가
app.use(requestLogger);
app.use(errorLogger);

// router 적용
app.use("/api", router);

// 404 에러 핸들러
app.use((req, res, next) => {
	next(new NotFoundError("요청하신 리소스를 찾을 수 없습니다."));
});

// 서버 시작
const startServer = async () => {
	try {
		// 글로벌 로깅 설정
		setupGlobalLogging();

		// 데이터베이스 초기화
		await initDatabase();

		// 서버 시작
		app.listen(3000, () => {
			logger.info("서버 시작됨", {
				port: 3000,
				env: process.env.NODE_ENV,
				timestamp: new Date().toISOString(),
			});
		});
	} catch (error) {
		logger.error("서버 시작 실패", {
			error: error.message,
			stack: error.stack,
		});
		process.exit(1);
	}
};

startServer();

module.exports = app;
