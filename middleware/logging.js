const logger = require('../utils/logger');

// HTTP 요청 로깅 미들웨어
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // 응답이 완료되면 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.originalUrl, // req.path 대신 originalUrl 사용
      query: Object.keys(req.query).length ? req.query : undefined, // 빈 객체 제외
      duration: `${duration}ms`,
      status: res.statusCode,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user?.id
    };

    // 불필요한 undefined 값 제거
    Object.keys(logData).forEach(key => 
      logData[key] === undefined && delete logData[key]
    );

    if (res.statusCode >= 400) {
      logger.warn('HTTP 요청 실패', logData);
    } else {
      logger.http('HTTP 요청 완료', logData);
    }
  });

  next();
};

// 에러 로깅 미들웨어
const errorLogger = (err, req, res, next) => {
  try {
    const logData = {
      name: err.name,
      message: err.message,
      status: err.status || 500,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      query: Object.keys(req.query).length ? req.query : undefined,
      body: req.body ? sanitizeRequestBody(req.body) : undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    };

    // 불필요한 undefined 값 제거
    Object.keys(logData).forEach(key => 
      logData[key] === undefined && delete logData[key]
    );

    if (err.status >= 500) {
      logger.error('서버 에러 발생', logData);
    } else {
      logger.warn('클라이언트 에러 발생', logData);
    }
  } catch (loggingError) {
    console.error('로깅 중 에러 발생:', loggingError);
  }

  next(err);
};

// 요청 바디 보안 처리 개선
const sensitiveFields = ['password', 'token', 'secret', 'creditCard', 'authorization'];
const sanitizeRequestBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  
  const sanitized = JSON.parse(JSON.stringify(body)); // 깊은 복사
  
  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.includes(key.toLowerCase())) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };

  sanitizeObject(sanitized);
  return sanitized;
};

module.exports = {
  requestLogger,
  errorLogger
}; 