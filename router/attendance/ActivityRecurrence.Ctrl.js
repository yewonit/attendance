// ActivityRecurrence.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
const models = require("../../../models/models"); // 실제 경로에 맞게 수정해야 합니다.
const crudController = require("../common/crud.Ctrl");

/**
 * ActivityRecurrence 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 반복 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityRecurrenceData = async (data) => {
  if (!data.activity_id) {
    const error = new Error("활동 ID는 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (!data.recurrence_type) {
    const error = new Error("반복 유형은 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (!data.start_date) {
    const error = new Error("시작 날짜는 필수입니다.");
    error.status = 400;
    throw error;
  }
  // 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityRecurrenceController = {
  /**
   * 새로운 활동 반복을 생성합니다. 데이터는 validateActivityRecurrenceData 함수를 통해 유효성을 검증받습니다.
   * @param {Object} req - 요청 객체, 활동 반복 데이터를 포함합니다.
   * @param {Object} res - 응답 객체, 생성된 활동 반복 정보를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  createActivityRecurrence: crudController.create(
    models.ActivityRecurrence,
    validateActivityRecurrenceData
  ),

  /**
   * 모든 활동 반복을 조회합니다.
   * @param {Object} req - 요청 객체.
   * @param {Object} res - 응답 객체, 조회된 모든 활동 반복 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readActivityRecurrences: crudController.readAll(models.ActivityRecurrence),

  /**
   * 주���진 ID로 단일 활동 반복을 조회합니다.
   * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 요청된 활동 반복 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readActivityRecurrence: crudController.readOne(models.ActivityRecurrence),

  /**
   * 지정된 ID의 활동 반복을 업데이트합니다. 업데이트 전 데이터는 validateActivityRecurrenceData를 통해 검증됩니다.
   * @param {Object} req - 요청 객체, 업데이트할 데이터와 활동 반복 ID를 포함합니다.
   * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  updateActivityRecurrence: crudController.update(
    models.ActivityRecurrence,
    validateActivityRecurrenceData
  ),

  /**
   * 지정된 ID의 활동 반복을 삭제합니다.
   * @param {Object} req - 요청 객체, 삭제할 활동 반복의 ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  deleteActivityRecurrence: crudController.delete(models.ActivityRecurrence),

  // ✨ 커스텀 기능 추가 영역
  // 🌟 여기에 추가적인 활동 반복 관련 커스텀 기능들을 구현할 수 있습니다.
  getRecurrencesByActivity: async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const recurrences = await models.ActivityRecurrence.findAll({
        where: { activity_id: activityId },
        include: [{ model: models.Activity, as: "Activity" }],
      });
      res.json(recurrences);
    } catch (error) {
      next(error);
    }
  },

  generateInstances: async (req, res, next) => {
    try {
      const { recurrenceId, endDate } = req.body;
      const recurrence = await models.ActivityRecurrence.findByPk(recurrenceId);
      if (!recurrence) {
        return res
          .status(404)
          .json({ message: "활동 반복을 찾을 수 없습니다." });
      }
      // 여기에 반복 규칙에 따라 인스턴스를 생성하는 로직을 구현합니다.
      // 이는 복잡한 로직이 될 수 있으므로, 별도의 서비스로 분리하는 것이 좋을 수 있습니다.
      res.json({ message: "인스턴스가 생성되었습니다." });
    } catch (error) {
      next(error);
    }
  },

  updateRecurrenceRule: async (req, res, next) => {
    try {
      const { recurrenceId } = req.params;
      const { newRule } = req.body;
      const recurrence = await models.ActivityRecurrence.findByPk(recurrenceId);
      if (!recurrence) {
        return res
          .status(404)
          .json({ message: "활동 반복을 찾을 수 없습니다." });
      }
      await recurrence.update(newRule);
      res.json({ message: "반복 규칙이 업데이트되었습니다." });
    } catch (error) {
      next(error);
    }
  },
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
module.exports = activityRecurrenceController;
