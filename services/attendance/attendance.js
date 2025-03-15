// Attendance.Ctrl.js

// 필요한 모델과 컨트롤러 유틸리티를 임포트합니다.
import models from "../../../models/models";
import crudController from "../common/crud";

/**
 * Attendance 데이터를 검증하기 위한 함수입니다.
 * 필수 필드가 누락되었거나 검증 실패 시 에러를 발생시킵니다.
 * @param {Object} data - 클라이언트로부터 제출된 출석 데이터.
 * @throws {Error} - 검증 실패 시 에러 객체를 생성하고 상태 코드와 함께 에러를 던집니다.
 */
const validateAttendanceData = async (data) => {
	if (!data.user_id) {
		const error = new Error("사용자 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.activity_instance_id) {
		const error = new Error("활동 인스턴스 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.attendance_status_id) {
		const error = new Error("출석 상태 ID는 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!data.attendance_role) {
		const error = new Error("참석 역할은 필수입니다.");
		error.status = 400;
		throw error;
	}
	if (!["PARTICIPANT", "LEADER", "ASSISTANT"].includes(data.attendance_role)) {
		const error = new Error("유효하지 않은 참석 역할입니다.");
		error.status = 400;
		throw error;
	}
	// 여기에 추가 데이터 검증 로직을 구현할 수 있습니다.
};

// 컨트롤러 객체를 정의하여 CRUD 연산을 캡슐화합니다.
const attendanceService = {
	/**
	 * 새로운 출석 기록을 생성합니다. 데이터는 validateAttendanceData 함수를 통해 유효성을 검증받습니다.
	 * @param {Object} req - 요청 객체, 출석 데이터를 포함합니다.
	 * @param {Object} res - 응답 객체, 생성된 출석 정보를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	createAttendance: crudController.create(
		models.Attendance,
		validateAttendanceData
	),

	/**
	 * 모든 출석 기록을 조회합니다.
	 * @param {Object} req - 요청 객체.
	 * @param {Object} res - 응답 객체, 조회된 모든 출석 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readAttendances: crudController.readAll(models.Attendance),

	/**
	 * 주어진 ID로 단일 출석 기록을 조회합니다.
	 * @param {Object} req - 요청 객체, ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 요청된 출석 데이터를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	readAttendance: crudController.readOne(models.Attendance),

	/**
	 * 지정된 ID의 출석 기록을 업데이트합니다. 업데이트 전 데이터는 validateAttendanceData를 통해 검증됩니다.
	 * @param {Object} req - 요청 객체, 업데이트할 데이터와 출석 ID를 포함합니다.
	 * @param {Object} res - 응답 객체, 업데이트 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	updateAttendance: crudController.update(
		models.Attendance,
		validateAttendanceData
	),

	/**
	 * 지정된 ID의 출석 기록을 삭제합니다.
	 * @param {Object} req - 요청 객체, 삭제할 출석의 ID를 매개변수로 기대합니다.
	 * @param {Object} res - 응답 객체, 삭제 성공 메시지를 반환합니다.
	 * @param {Function} next - 다음 미들웨어/에러 핸들러를 실행합니다.
	 */
	deleteAttendance: crudController.delete(models.Attendance),

	// ✨ 커스텀 기능 추가 영역
	getAttendanceByActivityInstance: async (req, res, next) => {
		try {
			const { activityInstanceId } = req.params;
			const attendances = await models.Attendance.findAll({
				where: { activity_instance_id: activityInstanceId },
				include: [
					{ model: models.User, as: "User" },
					{ model: models.AttendanceStatus, as: "AttendanceStatus" },
				],
			});
			res.json(attendances);
		} catch (error) {
			next(error);
		}
	},

	getAttendanceByUser: async (req, res, next) => {
		try {
			const { userId } = req.params;
			const attendances = await models.Attendance.findAll({
				where: { user_id: userId },
				include: [
					{ model: models.ActivityInstance, as: "ActivityInstance" },
					{ model: models.AttendanceStatus, as: "AttendanceStatus" },
				],
			});
			res.json(attendances);
		} catch (error) {
			next(error);
		}
	},

	checkIn: async (req, res, next) => {
		try {
			const { attendanceId } = req.params;
			const attendance = await models.Attendance.findByPk(attendanceId);
			if (!attendance) {
				return res
					.status(404)
					.json({ message: "출석 기록을 찾을 수 없습니다." });
			}
			await attendance.update({ check_in_time: new Date() });
			res.json({ message: "체크인이 완료되었습니다." });
		} catch (error) {
			next(error);
		}
	},

	checkOut: async (req, res, next) => {
		try {
			const { attendanceId } = req.params;
			const attendance = await models.Attendance.findByPk(attendanceId);
			if (!attendance) {
				return res
					.status(404)
					.json({ message: "출석 기록을 찾을 수 없습니다." });
			}
			await attendance.update({ check_out_time: new Date() });
			res.json({ message: "체크아웃이 완료되었습니다." });
		} catch (error) {
			next(error);
		}
	},
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default attendanceService;
