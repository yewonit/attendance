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

// 데이터베이스 로깅 함수들
const databaseLogger = {
	logConnection: async () => {
		try {
			await sequelize.authenticate();
			logger.info('데이터베이스 연결 성공');
		} catch (error) {
			logger.error('데이터베이스 연결 실패', {
				error: error.message
			});
			throw error;
		}
	},

	logSync: async () => {
		try {
			await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
			await sequelize.sync({ force: false });
			await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
			logger.info('데이터베이스 동기화 완료');
		} catch (error) {
			logger.error('데이터베이스 동기화 실패', {
				error: error.message,
				stack: error.stack
			});
			throw error;
		}
	}
};

// 서버 시작 함수
const startServer = async () => {
	try {
		await databaseLogger.logConnection();
		await databaseLogger.logSync();

		app.listen(3000, () => {
			logger.info('서버가 3000번 포트에서 시작되었습니다.');
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

// 글로벌 프로세스 로깅 설정
process.on('uncaughtException', (error) => {
	logger.error('처리되지 않은 예외 발생', {
		error: error.message,
		stack: error.stack,
		type: 'uncaughtException'
	});
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	logger.error('처리되지 않은 Promise 거부', {
		reason: reason?.message || reason,
		stack: reason?.stack,
		type: 'unhandledRejection'
	});
});

process.on('warning', (warning) => {
	logger.warn('시스템 경고 발생', {
		name: warning.name,
		message: warning.message,
		stack: warning.stack,
		type: 'warning'
	});
});

process.on('exit', (code) => {
	logger.info('프로세스 종료', {
		exitCode: code,
		type: 'processExit'
	});
});

// 시스템 시그널 핸들링
['SIGTERM', 'SIGINT'].forEach(signal => {
	process.on(signal, () => {
		logger.info('시스템 시그널 수신', { signal });
		// 정상적인 종료 처리
		process.exit(0);
	});
});

// 서버 시작
startServer();

module.exports = app;