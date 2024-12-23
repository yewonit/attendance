const winston = require('winston');
const { format } = winston;

// 로그 레벨 정의
const levels = {
  error: 0,    // 심각한 에러
  warn: 1,     // 경고성 메시지
  info: 2,     // 일반적인 정보
  http: 3,     // HTTP 요청 관련
  debug: 4     // 디버깅용
};

// 로그 색상 정의
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

const logger = winston.createLogger({
  levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

module.exports = logger;