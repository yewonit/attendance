import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./config/swagger.js";

import healthCheck from "./src/router/healthcheck.js";
import globalError from "./middleware/global_error.js";
import {
	errorLogger,
	requestLogger,
	setupGlobalLogging,
} from "./middleware/logging.js";
import router from "./src/router/apigateway.js";
import authRouter from "./src/router/auth/auth.js";
import { initDatabase } from "./src/utils/database.js";
import { NotFoundError } from "./src/utils/errors.js";
import logger from "./src/utils/logger.js";

const app = express();

// bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

// compression: 데이터 압축
app.use(compression());

// cors: 크로스오리진 지원, 모든 출처 허용 설정
app.use(cors());

// Swagger UI 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 로깅 미들웨어 제거 (전역 적용 대신 각 라우터에 개별 적용)
// app.use(requestLogger);

// router 적용 - 각 라우터에 requestLogger 적용
app.use(healthCheck);
app.use("/auth", requestLogger, authRouter);
app.use("/api", requestLogger, router);

// 에러 로깅 미들웨어는 유지
app.use(errorLogger);

app.use(globalError);

// 404 에러 핸들러 수정
app.use((req, res) => {
	// NotFoundError를 발생시키는 대신 직접 404 응답을 보냄
	res.status(404).send("404 not found");
});

// 서버 시작
const startServer = async () => {
	try {
		// 글로벌 로깅 설정
		setupGlobalLogging();

		// 데이터베이스 초기화
		await initDatabase();

		// 서버 시작
		const PORT = process.env.PORT || 3000; // 기본값 3000, 환경변수로 조정 가능
		app.listen(PORT, () => {
			logger.info("서버 시작됨", {
				port: PORT,
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
