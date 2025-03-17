// Activity.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models.js"; // 실제 경로에 맞게 수정해야 합니다.
import crudService from "../common/crud.js";

/**
 * Activity 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityData = async (data) => {
	if (!data.name) {
		const error = new Error("활동 명칭은 필수입니다.");
		error.status = 400;
		throw error;
	}

	if (!data.activity_category_id) {
		const error = new Error("활동 카테고리 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}

	if (!data.organization_id) {
		const error = new Error("주최 조직 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}

	if (
		!data.location_type ||
		!["OFFLINE", "ONLINE", "HYBRID"].includes(data.location_type)
	) {
		const error = new Error(
			"유효한 활동 장소 유형(OFFLINE, ONLINE, HYBRID)을 지정해야 합니다."
		);
		error.status = 400;
		throw error;
	}

	if (data.location_type !== "ONLINE" && !data.location) {
		const error = new Error(
			"오프라인 또는 하이브리드 활동의 경우 활동 장소를 지정해야 합니다."
		);
		error.status = 400;
		throw error;
	}

	if (
		(data.location_type === "ONLINE" || data.location_type === "HYBRID") &&
		!data.online_link
	) {
		const error = new Error(
			"온라인 또는 하이브리드 활동의 경우 온라인 링크를 제공해야 합니다."
		);
		error.status = 400;
		throw error;
	}

	if (!data.default_start_time || !data.default_end_time) {
		const error = new Error("기본 시작 시간과 종료 시간은 필수입니다.");
		error.status = 400;
		throw error;
	}

	if (data.is_deleted && !["Y", "N"].includes(data.is_deleted)) {
		const error = new Error("삭제 여부는 'Y' 또는 'N'이어야 합니다.");
		error.status = 400;
		throw error;
	}
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityService = {
	/**
	 * 새로운 활동을 생성합니다. 데이터는 validateActivityData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 활동 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 활동 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createActivity: crudService.create(models.Activity, validateActivityData),

	/**
	 * 모든 활동을 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 활동 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findActivities: crudService.findAll(models.Activity),

	/**
	 * 주어진 ID로 단일 활동을 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 활동 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	findActivity: crudService.findOne(models.Activity),

	/**
	 * 지정된 ID의 활동을 업데이트합니다. 업데이트 전 데이터는 validateActivityData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 활동 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateActivity: crudService.update(models.Activity, validateActivityData),

	/**
	 * 지정된 ID의 활동을 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 활동의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteActivity: crudService.delete(models.Activity),
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
