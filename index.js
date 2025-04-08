import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express from "express";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger.js';

import healthCheck from "./healthcheck.js";
import globalError from "./middleware/global_error.js";
import {
	errorLogger,
	requestLogger,
	setupGlobalLogging,
} from "./middleware/logging.js";
import router from "./router/apigateway.js";
import authRouter from "./router/auth/auth.js";
import { initDatabase } from "./utils/database.js";
import { NotFoundError } from "./utils/errors.js";
import logger from "./utils/logger.js";

const app = express();

// bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "50mb" }));

// compression: 데이터 압축
app.use(compression());

// cors: 크로스오리진 지원, 모든 출처 허용 설정
app.use(cors());

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// 로깅 미들웨어 추가
app.use(requestLogger);

// router 적용
app.use(healthCheck);
app.use("/auth", authRouter);
app.use("/api", router);

app.use(errorLogger);

app.use(globalError);

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
