// ActivityChangeHistory.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models";
import crudController from "../common/crud";

/**
 * ActivityChangeHistory 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 변경 이력 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityChangeHistoryData = async (data) => {
	if (!data.activity_id) {
		const error = new Error("관련 활동 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.changed_fields || Object.keys(data.changed_fields).length === 0) {
		const error = new Error("변경된 필드 정보는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.creator_id) {
		const error = new Error("생성자 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityChangeHistoryService = {
	/**
	 * 새로운 활동 변경 이력을 생성합니다. 데이터는 validateActivityChangeHistoryData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 활동 변경 이력 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 활동 변경 이력 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createActivityChangeHistory: crudController.create(
		models.ActivityChangeHistory,
		validateActivityChangeHistoryData
	),

	/**
	 * 모든 활동 변경 이력을 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 활동 변경 이력 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readActivityChangeHistories: crudController.readAll(
		models.ActivityChangeHistory
	),

	/**
	 * 주어진 ID로 단일 활동 변경 이력을 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 활동 변경 이력 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readActivityChangeHistory: crudController.readOne(
		models.ActivityChangeHistory
	),

	/**
	 * 지정된 ID의 활동 변경 이력을 업데이트합니다. 업데이트 전 데이터는 validateActivityChangeHistoryData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 활동 변경 이력 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateActivityChangeHistory: crudController.update(
		models.ActivityChangeHistory,
		validateActivityChangeHistoryData
	),

	/**
	 * 지정된 ID의 활동 변경 이력을 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 활동 변경 이력의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteActivityChangeHistory: crudController.delete(
		models.ActivityChangeHistory
	),

	// ✨ 커스텀 기능 추가 영역
	// 🌟 여기에 추가적인 활동 변경 이력 관련 커스텀 기능들을 구현할 수 있습니다.
	getChangeHistoryByActivity: async (req, res, next) => {
		try {
			const { activityId } = req.params;
			const changeHistory = await models.ActivityChangeHistory.findAll({
				where: { activity_id: activityId },
				order: [["created_at", "DESC"]],
				include: [
					{ model: models.Activity, as: "Activity" },
					{ model: models.User, as: "Creator" },
				],
			});
			res.json(changeHistory);
		} catch (error) {
			next(error);
		}
	},

	getRecentChanges: async (req, res, next) => {
		try {
			const { limit = 10 } = req.query;
			const recentChanges = await models.ActivityChangeHistory.findAll({
				order: [["created_at", "DESC"]],
				limit: parseInt(limit),
				include: [
					{ model: models.Activity, as: "Activity" },
					{ model: models.User, as: "Creator" },
				],
			});
			res.json(recentChanges);
		} catch (error) {
			next(error);
		}
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityChangeHistoryService;
