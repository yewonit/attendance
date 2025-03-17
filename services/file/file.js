// File.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models.js";
import crudService from "../common/crud.js";

/**
 * File 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 파일 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateFileData = async (data) => {
	if (!data.file_name) {
		const error = new Error("파일 이름은 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.file_path) {
		const error = new Error("파일 경로는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.file_size) {
		const error = new Error("파일 크기는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.file_type) {
		const error = new Error("파일 타입은 필수입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const fileService = {
	/**
	 * 새로운 파일을 생성합니다. 데이터는 validateFileData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 파일 생성 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 파일 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createFile: crudService.create(models.File, validateFileData),

	/**
	 * 모든 파일을 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 파일 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findFiles: crudService.findAll(models.File),

	/**
	 * 주어진 ID로 단일 파일을 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 파일 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findFile: crudService.findOne(models.File),

	/**
	 * 지정된 ID의 파일을 업데이트합니다. 업데이트 전 데이터는 validateFileData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 파일 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateFile: crudService.update(models.File, validateFileData),

	/**
	 * 지정된 ID의 파일을 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 파일의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteFile: crudService.delete(models.File),

	// ✨ 커스텀 기능 추가 영역
	// 🌟 여기에 추가적인 파일 관련 커스텀 기능들을 구현할 수 있습니다.
	// 예를 들어, 특정 유형의 파일만 조회하는 기능 등을 추가할 수 있습니다.
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default fileService;
