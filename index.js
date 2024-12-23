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
			name: error.name,
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString()
		});
		process.exit(1);
	});

	process.on('unhandledRejection', (reason, promise) => {
		logger.error('처리되지 않은 Promise 거부', {
			type: 'unhandledRejection',
			name: reason?.name,
			message: reason?.message || reason,
			stack: reason?.stack,
			timestamp: new Date().toISOString()
		});
	});

	// 메모리 사용량 경고
	process.on('warning', (warning) => {
		logger.warn('시스템 경고 발생', {
			type: warning.name,
			message: warning.message,
			stack: warning.stack,
			memoryUsage: {
				heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
				heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
				rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
			},
			timestamp: new Date().toISOString()
		});
	});

	// 프로세스 예외 처리 개선
	process.setUncaughtExceptionCaptureCallback((error) => {
		logger.error('캡처된 예외 발생', {
			type: 'capturedException',
			name: error.name,
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString()
		});
	});

	// Promise 체인에서 발생하는 에러 처리
	process.on('multipleResolves', (type, promise, reason) => {
		logger.error('Promise 다중 처리 감지', {
			type,
			reason: reason?.message || reason,
			stack: reason?.stack,
			timestamp: new Date().toISOString()
		});
	});

	// 프로세스 핸들러 개수 초과 경고
	process.setMaxListeners(15); // 기본값 10에서 증가
	process.on('maxListenersExceededWarning', (emitter, type) => {
		logger.warn('이벤트 리스너 초과 경고', {
			type,
			count: emitter.listenerCount(type),
			timestamp: new Date().toISOString()
		});
	});

	// 정상적인 종료 프로세스 개선
	const gracefulShutdown = async (signal) => {
		let exitCode = 0;
		const timeout = setTimeout(() => {
			logger.error('강제 종료: 시간 초과', {
				signal,
				timestamp: new Date().toISOString()
			});
			process.exit(1);
		}, 10000); // 10초 후 강제 종료

		try {
			logger.info('서버 종료 시작', { signal });

			// 새로운 요청 거부 및 기존 요청 처리 대기
			server.close(async () => {
				try {
					// 데이터베이스 연결 종료
					await sequelize.close();
					logger.info('데이터베이스 연결 종료됨');
					
					// 리소스 정리
					await cleanupResources();
					
					clearTimeout(timeout);
					process.exit(exitCode);
				} catch (error) {
					logger.error('리소스 정리 중 에러', {
						error: error.message,
						stack: error.stack
					});
					process.exit(1);
				}
			});

		} catch (error) {
			logger.error('종료 프로세스 중 에러', {
				error: error.message,
				stack: error.stack
			});
			clearTimeout(timeout);
			process.exit(1);
		}
	};

	// 리소스 정리 함수
	const cleanupResources = async () => {
		try {
			// 임시 파일 정리, 캐시 정리 등
			logger.info('시스템 리소스 정리 시작');
			
			// 메모리 상태 로깅
			const memoryUsage = process.memoryUsage();
			logger.info('최종 메모리 사용량', {
				heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
				heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
				rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`
			});

		} catch (error) {
			logger.error('리소스 정리 중 에러', {
				error: error.message,
				stack: error.stack
			});
			throw error;
		}
	};

	// 시스템 시그널 처리
	['SIGTERM', 'SIGINT', 'SIGUSR2'].forEach(signal => {
		process.on(signal, () => gracefulShutdown(signal));
	});

	// Node.js 프로세스 종료 직전
	process.on('exit', (code) => {
		logger.info('프로세스 종료', {
			exitCode: code,
			timestamp: new Date().toISOString()
		});
	});

	// 프로세스 메모리 임계치 모니터링
	const memoryThreshold = 1024 * 1024 * 1024; // 1GB
	setInterval(() => {
		const memoryUsage = process.memoryUsage();
		if (memoryUsage.heapUsed > memoryThreshold) {
			logger.warn('높은 메모리 사용량 감지', {
				heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
				threshold: `${Math.round(memoryThreshold / 1024 / 1024)}MB`,
				timestamp: new Date().toISOString()
			});
		}
	}, 30000); // 30초마다 체크
};

// 활성 연결 수 확인 유틸리티 함수
const getActiveConnections = () => {
	return new Promise((resolve) => {
		if (!server) {
			resolve(0);
			return;
		}
		server.getConnections((err, count) => {
			if (err) {
				logger.error('활성 연결 수 확인 중 에러', { error: err });
				resolve(0);
				return;
			}
			resolve(count);
		});
	});
};

// 데이터���이스 로깅
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