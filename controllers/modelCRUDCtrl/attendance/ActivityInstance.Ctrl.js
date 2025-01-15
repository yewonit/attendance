// ActivityInstance.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
const models = require("../../../models/models"); // 실제 경로에 맞게 수정해야 합니다.
const crudController = require("../common/crud.Ctrl");

/**
 * ActivityInstance 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 활동 인스턴스 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateActivityInstanceData = async (data) => {
	if (!data.activity_id) {
		const error = new Error("관련 활동 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.start_datetime) {
		const error = new Error("실제 시작 일시는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.end_datetime) {
		const error = new Error("실제 종료 일시는 필수입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const activityInstanceController = {
	/**
	 * 새로운 활동 인스턴스를 생성합니다. 데이터는 validateActivityInstanceData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 활동 인스턴스 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 활동 인스턴스 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createActivityInstance: crudController.create(
		models.ActivityInstance,
		validateActivityInstanceData
	),

	/**
	 * 모든 활동 인스턴스를 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 활동 인스턴스 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readActivityInstances: crudController.readAll(models.ActivityInstance),

	/**
	 * 주어진 ID로 단일 활동 인스턴스를 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 활동 인스턴스 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readActivityInstance: crudController.readOne(models.ActivityInstance),

	/**
	 * 지정된 ID의 활동 인스턴스를 업데이트합니다. 업데이트 전 데이터는 validateActivityInstanceData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 활동 인스턴스 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateActivityInstance: crudController.update(
		models.ActivityInstance,
		validateActivityInstanceData
	),

	/**
	 * 지정된 ID의 활동 인스턴스를 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 활동 인스턴스의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteActivityInstance: crudController.delete(models.ActivityInstance),

	// ✨ 커스텀 기능 추가 영역
	// 🌟 여기에 추가적인 활동 인스턴스 관련 커스텀 기능들을 구현할 수 있습니다.
	getInstancesByActivity: async (req, res, next) => {
		try {
			const { activityId } = req.params;
			const instances = await models.ActivityInstance.findAll({
				where: { activity_id: activityId },
				order: [["start_datetime", "ASC"]],
				include: [{ model: models.Activity, as: "Activity" }],
			});
			res.json(instances);
		} catch (error) {
			next(error);
		}
	},

	getChildInstances: async (req, res, next) => {
		try {
			const { parentInstanceId } = req.params;
			const childInstances = await models.ActivityInstance.findAll({
				where: { parent_instance_id: parentInstanceId },
				order: [["start_datetime", "ASC"]],
			});
			res.json(childInstances);
		} catch (error) {
			next(error);
		}
	},

	cancelActivityInstance: async (req, res, next) => {
		try {
			const { instanceId } = req.params;
			const instance = await models.ActivityInstance.findByPk(instanceId);
			if (!instance) {
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}
			await instance.update({ is_canceled: true });
			res.json({ message: "활동 인스턴스가 취소되었습니다." });
		} catch (error) {
			next(error);
		}
	},

	updateAttendanceCount: async (req, res, next) => {
		try {
			const { instanceId } = req.params;
			const { attendanceCount } = req.body;
			const instance = await models.ActivityInstance.findByPk(instanceId);
			if (!instance) {
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}
			await instance.update({ attendance_count: attendanceCount });
			res.json({ message: "참석자 수가 업데이트되었습니다." });
		} catch (error) {
			next(error);
		}
	},

	createActivityInstanceByNecessary: async (req, res, next) => {
		let modelDto = {
			parent_instance_id: null,
			actual_location: null,
			actual_online_link: null,
			notes: null,
			attendance_count: 0,
			is_canceled: false,
			creator_id: 1,
			updater_id: 1,
		};
		try {
			const body = req.body;
			await validateActivityInstanceData(body);
			Object.assign(modelDto, body);
			modelDto.creator_id = body.user_id;
			modelDto.updater_id = body.user_id;

			const data = await models.ActivityInstance.create(modelDto);

			res.status(201).json({ data, message: "생성 완료" });
		} catch (error) {
			next(error);
		}
	},

	updateActivityInstanceByNecessary: async (req, res, next) => {
		try {
			const { id } = req.params;
			const body = req.body;
			await validateActivityInstanceData(body);
			const instance = await models.ActivityInstance.findByPk(id);
			if (!instance) {
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}

			body.updater_id = body.user_id;
			const data = await instance.update(body);
			res.json({ data, message: "업데이트되었습니다." });
		} catch (error) {
			next(error);
		}
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
module.exports = activityInstanceController;
