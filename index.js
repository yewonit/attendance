const express = require('express');
const compression = require('compression');
const cors = require('cors');
const logger = require('./utils/logger');
const { requestLogger, errorLogger } = require('./middleware/logging');
const { NotFoundError } = require('./utils/errors');
const router = require('./router');
const { sequelize } = require('./models/models');
const bodyParser = require("body-parser")

const app = express();

// bodyParser: req.body 변수 생성 & 손쉬운 데이터 파싱을 지원
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// compression: 데이터 압축
app.use(compression())

// cors: 크로스오리진 지원, 모든 출처 허용 설정
app.use(cors())

// 로깅 미들웨어 추가
app.use(requestLogger);

// router 적용
app.use("/api", router)

// 글로벌 로깅 설정
const setupGlobalLogging = () => {
	// 예기치 않은 에러 로깅
	process.on('uncaughtException', (error) => {
		logger.error('처리되지 않은 예외 발생', {
			type: 'uncaughtException',
			error: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString()
		});
		// 로그가 저장될 시간을 주기 위해 약간의 지연 후 종료
		setTimeout(() => process.exit(1), 1000);
	});

	process.on('unhandledRejection', (reason, promise) => {
		logger.error('처리되지 않은 Promise 거부', {
			type: 'unhandledRejection',
			reason: reason?.message || reason,
			stack: reason?.stack,
			timestamp: new Date().toISOString()
		});
	});

	// 시스템 이벤트 로깅
	process.on('warning', (warning) => {
		logger.warn('시스템 경고 발생', {
			type: warning.name,
			message: warning.message,
			stack: warning.stack,
			timestamp: new Date().toISOString()
		});
	});

	// 정상적인 종료 프로세스
	const gracefulShutdown = async (signal) => {
		try {
			logger.info('서버 종료 시작', {
				signal,
				timestamp: new Date().toISOString()
			});

			// 데이터베이스 연결 종료
			await sequelize.close();
			logger.info('데이터베이스 연결 종료됨');

			// 로그가 저장될 시간을 주기 위해 약간의 지연 후 종료
			setTimeout(() => {
				logger.info('프로세스 정상 종료');
				process.exit(0);
			}, 1000);

		} catch (error) {
			logger.error('서버 종료 중 에러 발생', {
				error: error.message,
				stack: error.stack
			});
			process.exit(1);
		}
	};

	// 시스템 시그널 처리
	['SIGTERM', 'SIGINT'].forEach(signal => {
		process.on(signal, () => gracefulShutdown(signal));
	});
};

// 데이터베이스 로깅
const initDatabase = async () => {
	try {
		await sequelize.authenticate();
		logger.info('데이터베이스 연결 성공');

		await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
		await sequelize.sync({ force: false });
		await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
		
		logger.info('데이터베이스 동기화 완료');
	} catch (error) {
		logger.error('데이터베이스 초기화 실패', {
			error: error.message,
			stack: error.stack
		});
		throw error; // 상위에서 처리하도록 에러 전파
	}
};

// 서버 시작
const startServer = async () => {
	try {
		// 글로벌 로깅 설정
		setupGlobalLogging();
		
		// 데이터베이스 초기화
		await initDatabase();

		// 서버 시작
		app.listen(3000, () => {
			logger.info('서버 시작됨', {
				port: 3000,
				env: process.env.NODE_ENV,
				timestamp: new Date().toISOString()
			});
		});

	} catch (error) {
		logger.error('서버 시작 실패', {
			error: error.message,
			stack: error.stack
		});
		process.exit(1);
	}
};

// 404 에러 핸들러
app.use((req, res, next) => {
	next(new NotFoundError('요청하신 리소스를 찾을 수 없습니다.'));
});

// 에러 로깅 및 핸들링
app.use(errorLogger);
app.use((err, req, res, next) => {
	// 에러 로깅 개선
	logger.error('API 에러 발생', {
		type: err.name,
		message: err.message,
		status: err.status || 500,
		path: req.path,
		method: req.method,
		body: req.body,
		query: req.query,
		user: req.user?.id,
		timestamp: new Date().toISOString(),
		stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
	});

	const errorResponse = {
		success: false,
		error: {
			code: err.status || 500,
			message: err.message || '서버 오류가 발생했습니다.',
			type: err.name || 'ServerError'
		}
	};

	if (process.env.NODE_ENV === 'development') {
		errorResponse.error.stack = err.stack;
	}

	res.status(errorResponse.error.code).json(errorResponse);
});

startServer();

module.exports = app;