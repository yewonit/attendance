// 기본 커스텀 에러 클래스
class AppError extends Error {
	constructor(message, status) {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
		Error.captureStackTrace(this, this.constructor);
	}
}

// 특정 에러 타입들
class ValidationError extends AppError {
	constructor(message) {
		super(message, 400);
	}
}

class AuthenticationError extends AppError {
	constructor(message) {
		super(message, 401);
	}
}

class NotFoundError extends AppError {
	constructor(message) {
		super(message, 404);
	}
}

class DataConflictError extends AppError {
	constructor(message) {
		super(message, 409);
	}
}

export {
	AppError,
	AuthenticationError,
	NotFoundError,
	ValidationError,
	DataConflictError,
};
