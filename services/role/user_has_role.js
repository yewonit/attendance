// UserHasRole.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models.js";
import crudService from "../common/crud.js";

/**
 * UserHasRole 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 역할 할당 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateUserHasRoleData = async (data) => {
	if (!data.user_id) {
		const error = new Error("사용자 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.role_id) {
		const error = new Error("역할 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.organization_id) {
		const error = new Error("조직 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const userHasRoleService = {
	/**
	 * 새로운 역할 할당을 생성합니다. 데이터는 validateUserHasRoleData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 역할 할당 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 역할 할당 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createUserHasRole: crudService.create(
		models.UserHasRole,
		validateUserHasRoleData
	),

	/**
	 * 모든 역할 할당을 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 역할 할당 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findUserHasRoles: crudService.findAll(models.UserHasRole),

	/**
	 * 주어진 ID로 단일 역할 할당을 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 역할 할당 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findUserHasRole: crudService.findOne(models.UserHasRole),

	/**
	 * 지정된 ID의 역할 할당을 업데이트합니다. 업데이트 전 데이터는 validateUserHasRoleData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 역할 할당 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateUserHasRole: crudService.update(
		models.UserHasRole,
		validateUserHasRoleData
	),

	/**
	 * 지정된 ID의 역할 할당을 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 역할 할당의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteUserHasRole: crudService.delete(models.UserHasRole),

	// ✨ 커스텀 기능 추가 영역
	// 🌟 여기에 추가적인 역할 할당 관련 커스텀 기능들을 구현할 수 있습니다.
	// 예를 들어, 특정 사용자의 모든 역할을 조회하는 기능 등을 추가할 수 있습니다.
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default userHasRoleService;
