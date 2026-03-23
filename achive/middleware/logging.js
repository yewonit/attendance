import logger from "../src/utils/logger.js";

// HTTP 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
	// 응답이 완료되면 로깅
	res.on("finish", () => {
		// 로그 데이터를 객체 대신 문자열 한 줄로 구성
		const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode}${
			Object.keys(req.query).length ? " query:" + JSON.stringify(req.query) : ""
		}`;

		logger.info(logMessage);
	});

	next();
};

// 에러 로깅 미들웨어
const errorLogger = (err, req, res, next) => {
	const now = Date.now();
	try {
		const logData = {
			timestamp: now,
			name: err.name,
			message: err.message,
			status: err.status || 500,
			path: req.originalUrl,
			method: req.method,
			userId: req.user?.id,
			query: Object.keys(req.query).length ? req.query : undefined,
			body: req.body ? sanitizeRequestBody(req.body) : undefined,
			stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		};

		// 불필요한 undefined 값 제거
		Object.keys(logData).forEach(
			(key) => logData[key] === undefined && delete logData[key]
		);

		if (err.status >= 500) {
			logger.error("서버 에러 발생", logData);
		} else {
			logger.warn("클라이언트 에러 발생", logData);
		}
	} catch (loggingError) {
		console.error("로깅 중 에러 발생:", loggingError);
	}

	next(err);
};

// 요청 바디 보안 처리 개선
const sensitiveFields = [
	"password",
	"token",
	"secret",
	"creditCard",
	"authorization",
];
const sanitizeRequestBody = (body) => {
	if (!body || typeof body !== "object") return body;

	const sanitized = JSON.parse(JSON.stringify(body)); // 깊은 복사

	const sanitizeObject = (obj) => {
		Object.keys(obj).forEach((key) => {
			if (sensitiveFields.includes(key.toLowerCase())) {
				obj[key] = "[REDACTED]";
			} else if (typeof obj[key] === "object" && obj[key] !== null) {
				sanitizeObject(obj[key]);
			}
		});
	};

	sanitizeObject(sanitized);
	return sanitized;
};

// 글로벌 로깅 설정
const setupGlobalLogging = () => {
	// 예기치 않은 에러 로깅
	process.on("uncaughtException", (error) => {
		logger.error("처리되지 않은 예외 발생", {
			type: "uncaughtException",
			name: error.name,
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString(),
		});
		process.exit(1);
	});

	process.on("unhandledRejection", (reason, promise) => {
		logger.error("처리되지 않은 Promise 거부", {
			type: "unhandledRejection",
			name: reason?.name,
			message: reason?.message || reason,
			stack: reason?.stack,
			timestamp: new Date().toISOString(),
		});
	});

	// 프로세스 예외 처리 개선
	process.setUncaughtExceptionCaptureCallback((error) => {
		logger.error("캡처된 예외 발생", {
			type: "capturedException",
			name: error.name,
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString(),
		});
	});

	// Promise 체인에서 발생하는 에러 처리
	process.on("multipleResolves", (type, promise, reason) => {
		logger.error("Promise 다중 처리 감지", {
			type,
			reason: reason?.message || reason,
			stack: reason?.stack,
			timestamp: new Date().toISOString(),
		});
	});

	// Node.js 프로세스 종료 직전
	process.on("exit", (code) => {
		logger.info("프로세스 종료", {
			exitCode: code,
			timestamp: new Date().toISOString(),
		});
	});
};

export { requestLogger, errorLogger, setupGlobalLogging };
