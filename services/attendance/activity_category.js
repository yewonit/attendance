// ActivityCategory.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
const models = require("../../../models/models"); // 실제 경로에 맞게 수정해야 합니다.
const crudController = require("../common/crud");

/**
 * ActivityCategory 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 카테고리 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityCategoryData = async (data) => {
  if (!data.name) {
    const error = new Error("활동 카테고리 이름은 필수입니다.");
    error.status = 400;
    throw error;
  }

  // parent_id가 제공된 경우, 해당 ID의 카테고리가 존재하는지 확인
  if (data.parent_id) {
    const parentCategory = await models.ActivityCategory.findByPk(
      data.parent_id
    );
    if (!parentCategory) {
      const error = new Error("지정된 상위 카테고리가 존재하지 않습니다.");
      error.status = 400;
      throw error;
    }
  }

  // is_deleted 필드가 'Y' 또는 'N'인지 확인
  if (data.is_deleted && !["Y", "N"].includes(data.is_deleted)) {
    const error = new Error("삭제 여부는 'Y' 또는 'N'이어야 합니다.");
    error.status = 400;
    throw error;
  }

  // creator_id, updater_id가 유효한 사용자 ID인지 확인하는 로직 추가 가능
  // 예: const user = await models.User.findByPk(data.creator_id);

  // IP 주소 형식 검증 (간단한 정규식 사용)
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (data.creator_ip && !ipRegex.test(data.creator_ip)) {
    const error = new Error("유효하지 않은 생성자 IP 주소 형식입니다.");
    error.status = 400;
    throw error;
  }
  if (data.updater_ip && !ipRegex.test(data.updater_ip)) {
    const error = new Error("유효하지 않은 수정자 IP 주소 형식입니다.");
    error.status = 400;
    throw error;
  }
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityCategoryController = {
  /**
   * 새로운 활동 카테고리를 생성합니다. 데이터는 validateActivityCategoryData 함수를 통해 유효성을 검증받습니다.
   * @param {Object} req - 요청 객체, 활동 카테고리 데이터를 포함합니다.
   * @param {Object} res - 응답 객체, 생성된 활동 카테고리 정보를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  createActivityCategory: crudController.create(
    models.ActivityCategory,
    validateActivityCategoryData
  ),

  /**
   * 모든 활동 카테고리를 조회합니다.
   * @param {Object} req - 요청 객체.
   * @param {Object} res - 응답 객체, 조회된 모든 활동 카테고리 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readActivityCategories: crudController.readAll(models.ActivityCategory),

  /**
   * 주어진 ID로 단일 활동 카테고리를 조회합니다.
   * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 요청된 활동 카테고리 데이터를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  readActivityCategory: crudController.readOne(models.ActivityCategory),

  /**
   * 지정된 ID의 활동 카테고리를 업데이트합니다. 업데이트 전 데이터는 validateActivityCategoryData를 통해 검증됩니다.
   * @param {Object} req - 요청 객체, 업데이트할 데이터와 카테고리 ID를 포함합니다.
   * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  updateActivityCategory: crudController.update(
    models.ActivityCategory,
    validateActivityCategoryData
  ),

  /**
   * 지정된 ID의 활동 카테고리를 삭제합니다.
   * @param {Object} req - 요청 객체, 삭제할 카테고리의 ID를 매개변수로 기대합니다.
   * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
   * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
   */
  deleteActivityCategory: crudController.delete(models.ActivityCategory),

  // ✨ 커스텀 기능 추가 영역
  // 🌟 여기에 추가적인 활동 카테고리 관련 커스텀 기능들을 구현할 수 있습니다.
  // 예를 들어, 특정 카테고리로 분류된 모든 활동의 목록을 제공하는 기능 등을 추가할 수 있습니다.
  getActivityCategoryHierarchy: async (req, res, next) => {
    try {
      const categories = await models.ActivityCategory.findAll({
        where: { parent_id: null },
        include: [
          {
            model: models.ActivityCategory,
            as: "Children",
            include: { all: true, nested: true },
          },
        ],
      });
      res.json(categories);
    } catch (error) {
      next(error);
    }
  },

  moveActivityCategory: async (req, res, next) => {
    try {
      const { id, newParentId } = req.body;
      const category = await models.ActivityCategory.findByPk(id);
      if (!category) {
        return res
          .status(404)
          .json({ message: "카테고리를 찾을 수 없습니다." });
      }
      await category.update({ parent_id: newParentId });
      res.json({ message: "카테고리가 성공적으로 이동되었습니다." });
    } catch (error) {
      next(error);
    }
  },
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
module.exports = activityCategoryController;
