const { ValidationError, AuthenticationError, NotFoundError, AppError } = require('./errors');

// 데이터베이스 관련 에러
const DatabaseErrors = {
  ConnectionError: () => new AppError('데이터베이스 연결에 실패했습니다.', 503),
  QueryError: (detail) => new AppError(`데이터베이스 쿼리 실행 중 오류가 발생했습니다: ${detail}`, 500),
  UniqueViolation: (field) => new ValidationError(`이미 존재하는 ${field} 입니다.`),
  ForeignKeyViolation: () => new ValidationError('참조 무결성 제약조건을 위반했습니다.')
};

// 인증 관련 에러
const AuthErrors = {
  InvalidCredentials: () => new AuthenticationError('아이디 또는 비밀번호가 올바르지 않습니다.'),
  TokenExpired: () => new AuthenticationError('인증이 만료되었습니다. 다시 로그인해주세요.'),
  TokenInvalid: () => new AuthenticationError('유효하지 않은 인증 토큰입니다.'),
  Unauthorized: () => new AuthenticationError('해당 작업에 대한 권한이 없습니다.'),
  RequireLogin: () => new AuthenticationError('로그인이 필요한 서비스입니다.')
};

// 리소스 관련 에러
const ResourceErrors = {
  NotFound: (resource) => new NotFoundError(`요청하신 ${resource}를 찾을 수 없습니다.`),
  AlreadyExists: (resource) => new ValidationError(`이미 존재하는 ${resource}입니다.`),
  InvalidStatus: (resource) => new ValidationError(`유효하지 않은 ${resource} 상태입니다.`)
};

// 입력값 검증 관련 에러
const ValidationErrors = {
  Required: (field) => new ValidationError(`${field}는 필수 입력값입니다.`),
  InvalidFormat: (field) => new ValidationError(`${field}의 형식이 올바르지 않습니다.`),
  InvalidLength: (field, min, max) => new ValidationError(
    `${field}는 ${min}자 이상 ${max}자 이하여야 합니다.`
  ),
  InvalidValue: (field, detail) => new ValidationError(`${field}의 값이 올바르지 않습니다: ${detail}`),
  InvalidEnum: (field, allowedValues) => new ValidationError(
    `${field}는 다음 중 하나여야 합니다: ${allowedValues.join(', ')}`
  )
};

// 파일 관련 에러
const FileErrors = {
  UploadFailed: () => new AppError('파일 업로드에 실패했습니다.', 500),
  InvalidType: (allowedTypes) => new ValidationError(
    `지원하지 않는 파일 형식입니다. 지원 형식: ${allowedTypes.join(', ')}`
  ),
  MaxSizeExceeded: (maxSize) => new ValidationError(`파일 크기는 ${maxSize}MB를 초과할 수 없습니다.`)
};

module.exports = {
  DatabaseErrors,
  AuthErrors,
  ResourceErrors,
  ValidationErrors,
  FileErrors
}; 