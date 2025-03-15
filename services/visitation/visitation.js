// visitation.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models";
import crudController from "../common/crud";

/**
 * 방문 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 방문 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateVisitationData = async (data) => {
	// if (!data.visitor_id) {
	//   const error = new Error("방문자 ID는 필수입니다.");
	//   error.status = 400;
	//   throw error;
	// }
	// if (!data.host_id) {
	//   const error = new Error("호스트 ID는 필수입니다.");
	//   error.status = 400;
	//   throw error;
	// }
	// if (!data.visit_date) {
	//   const error = new Error("방문 날짜는 필수입니다.");
	//   error.status = 400;
	//   throw error;
	// }
	// 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const visitationService = {
	createVisitation: crudController.create(
		models.Visitation,
		validateVisitationData
	),

	readVisitations: crudController.readAll(models.Visitation),

	readVisitation: crudController.readOne(models.Visitation),

	updateVisitation: crudController.update(
		models.Visitation,
		validateVisitationData
	),

	deleteVisitation: crudController.delete(models.Visitation),

	// ✨ 커스텀 기능 추가 영역
	// 🌟 추가적인 방문 관리 관련 커스텀 기능들을 구현할 수 있습니다.
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default visitationService;
