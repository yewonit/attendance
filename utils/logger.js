const fs = require('fs');
const path = require('path');

// 로그 디렉토리 생성
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// ... 나머지 logger 코드 ... 