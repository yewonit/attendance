const logger = require('../utils/logger');

const login = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    logger.info('로그인 시도', { email });
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn('존재하지 않는 사용자 로그인 시도', { email });
      throw AuthErrors.InvalidCredentials();
    }

    const token = await generateToken(user);
    logger.info('로그인 성공', { userId: user.id });
    
    res.json({ token });
  } catch (error) {
    next(error);
  }
}; 