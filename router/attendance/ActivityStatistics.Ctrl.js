// ActivityStatistics.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
const models = require("../../../models/models"); // 실제 경로에 맞게 수정해야 합니다.
const crudController = require("../common/crud.Ctrl");

/**
 * ActivityStatistics 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 통계 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityStatisticsData = async (data) => {
  if (!data.activity_id) {
    const error = new Error("관련 활동 ID는 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (!data.date) {
    const error = new Error("통계 날짜는 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (data.total_instances === undefined) {
    const error = new Error("총 인스턴스 수는 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (data.total_attendance === undefined) {
    const error = new Error("총 출석 수는 필수입니다.");
    error.status = 400;
    throw error;
  }
  if (data.average_attendance === undefined) {
    const error = new Error("평균 출석률은 필수입니다.");
    error.status = 400;
    throw error;
  }
  // 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityStatisticsController = {
  /**
   * 새로운 활동 통계를 생성합니다. 데이터는 validateActivityStatisticsData 함수를 통해 유효성을 검증받습니다.
   * @param {Object} req - 요청 객체, 활동 통계 데이터를 포함합니다.
   * @param {Object} res - 응답 객체, 생성된 활동 통계 정보를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  createActivityStatistics: crudController.create(
    models.ActivityStatistics,
    validateActivityStatisticsData
  ),

  /**
   * 모든 활동 통계를 조���합니다.
   * @param {Object} req - 요청 객체.
   * @param {Object} res - 응답 객체, 조회된 모든 활동 통계 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readActivityStatistics: crudController.readAll(models.ActivityStatistics),

  /**
   * 주어진 ID로 단일 활동 통계를 조회합니다.
   * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 요청된 활동 통계 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readOneActivityStatistics: crudController.readOne(models.ActivityStatistics),

  /**
   * 지정된 ID의 활동 통계를 업데이트합니다. 업데이트 전 데이터는 validateActivityStatisticsData를 통해 검증됩니다.
   * @param {Object} req - 요청 객체, 업데이트할 데이터와 활동 통계 ID를 포함합니다.
   * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  updateActivityStatistics: crudController.update(
    models.ActivityStatistics,
    validateActivityStatisticsData
  ),

  /**
   * 지정된 ID의 활동 통계를 삭제합니다.
   * @param {Object} req - 요청 객체, 삭제할 활동 통계의 ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  deleteActivityStatistics: crudController.delete(models.ActivityStatistics),

  // ✨ 커스텀 기능 추가 영역
  // 🌟 여기에 추가적인 활동 통계 관련 커스텀 기능들을 구현할 수 있습니다.
  getStatisticsByActivity: async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const statistics = await models.ActivityStatistics.findAll({
        where: { activity_id: activityId },
        order: [["date", "DESC"]],
        include: [{ model: models.Activity, as: "Activity" }],
      });
      res.json(statistics);
    } catch (error) {
      next(error);
    }
  },

  getStatisticsByDateRange: async (req, res, next) => {
    try {
      const { activityId, startDate, endDate } = req.query;
      const statistics = await models.ActivityStatistics.findAll({
        where: {
          activity_id: activityId,
          date: {
            [models.Sequelize.Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "ASC"]],
        include: [{ model: models.Activity, as: "Activity" }],
      });
      res.json(statistics);
    } catch (error) {
      next(error);
    }
  },

  calculateAverageAttendance: async (req, res, next) => {
    try {
      const { activityId } = req.params;
      const result = await models.ActivityStatistics.findOne({
        where: { activity_id: activityId },
        attributes: [
          [
            models.Sequelize.fn(
              "AVG",
              models.Sequelize.col("average_attendance")
            ),
            "overallAverageAttendance",
          ],
        ],
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
module.exports = activityStatisticsController;
