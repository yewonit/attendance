// AttendanceStatus.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../models/models.js";
import crudService from "../common/crud.js";

/**
 * AttendanceStatus 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 출석 상태 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateAttendanceStatusData = async (data) => {
	if (!data.name) {
		const error = new Error("상태명은 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (data.is_counted_as_attended === undefined) {
		const error = new Error("출석으로 인정 여부는 필수입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const attendanceStatusService = {
	/**
	 * 새로운 출석 상태를 생성합니다. 데이터는 validateAttendanceStatusData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 출석 상태 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 출석 상태 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createAttendanceStatus: crudService.create(
		models.AttendanceStatus,
		validateAttendanceStatusData
	),

	/**
	 * 모든 출석 상태를 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 출석 상태 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findAttendanceStatuses: crudService.findAll(models.AttendanceStatus),

	/**
	 * 주어진 ID로 단일 출석 상태를 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 출석 상태 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findAttendanceStatus: crudService.findOne(models.AttendanceStatus),

	/**
	 * 지정된 ID의 출석 상태를 업데이트합니다. 업데이트 전 데이터는 validateAttendanceStatusData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 출석 상태 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateAttendanceStatus: crudService.update(
		models.AttendanceStatus,
		validateAttendanceStatusData
	),

	/**
	 * 지정된 ID의 출석 상태를 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 출석 상태의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteAttendanceStatus: crudService.delete(models.AttendanceStatus),
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default attendanceStatusService;
