const logger = require('../utils/logger');

// 인증 미들웨어 예시
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      logger.warn('인증 토큰 없음', { 
        path: req.path, 
        method: req.method 
      });
      throw AuthErrors.TokenInvalid();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    logger.debug('사용자 인증 성공', { 
      userId: decoded.id, 
      path: req.path 
    });
    
    next();
  } catch (error) {
    logger.error('인증 처리 중 에러 발생', {
      error: error.message,
      path: req.path,
      token: token ? '존재함' : '없음'
    });
    next(error);
  }
}; 