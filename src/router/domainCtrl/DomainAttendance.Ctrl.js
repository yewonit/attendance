import { activityTemplate } from "../../enums/activity_template.js";
import models from "../../models/models.js";
import { sequelize } from "../../utils/database.js";
// 기존의 attendanceController 객체
const attendanceController = {
	// recordAttendance 함수 추가
	recordAttendance: async (req, res, next) => {
		try {
			const { organizationId, activityId } = req.params;
			const { userId, instanceData, attendances, imageInfo } = req.body;

			// 임시 사용자 ID 설정 (나중에 인증 시스템으로 대체해야 함)
			const currentUserId = userId || 1; // 임시 사용자 ID

			// 필수 데이터 검증
			if (!activityId || !instanceData || !attendances) {
				return res.status(400).json({
					message: `필수 데이터가 누락되었습니다. activityId: ${activityId}, instanceData: ${instanceData}, attendances: ${attendances}`,
				});
			}

			// instanceData 필드 검증
			if (!instanceData.startDateTime || !instanceData.endDateTime) {
				return res
					.status(400)
					.json({ message: "시작 시간과 종료 시간은 필수입니다." });
			}

			// 조직이 존재하는지 확인
			const organization = await models.Organization.findByPk(organizationId);
			if (!organization) {
				return res.status(404).json({ message: "조직을 찾을 수 없습니다." });
			}

			// 활동이 존재하는지 확인
			const template = Object.values(activityTemplate).find(
				(at) => at.id === activityId
			);
			if (!template) {
				return res
					.status(404)
					.json({ message: "해당 활동 템플릿을 찾을 수 없습니다." });
			}

			// 활동 인스턴스 생성
			const activity = await models.Activity.create({
				name: template.name,
				description: activityInstance.notes,
				activity_category: template.activityCategory,
				organization_id: organizationId,
				start_time: instanceData.startDateTime,
				end_time: instanceData.endDateTime,
			});

			// 파일 정보 저장
			let imageData = null; // fileData 변수를 미리 선언

			if (
				imageInfo &&
				typeof imageInfo === "object" &&
				imageInfo.url &&
				imageInfo.fileName &&
				imageInfo.fileType
			) {
				try {
					imageData = await models.ActivityImage.create({
						activity_id: activity.id,
						name: imageInfo.fileName,
						path: imageInfo.url,
					});
				} catch (fileError) {
					next(fileError);
				}
			}

			await Promise.all(
				attendances.map(async (attendance) => {
					await models.Attendance.create({
						activity_id: activity.id,
						user_id: attendance.userId,
						attendance_status: attendance.status,
						description: attendance.notes,
					});
				})
			);

			res.status(200).json({
				message: "출석 정보가 성공적으로 기록되었습니다.",
				activityInstance: {
					id: activity.id,
					startDateTime: activity.start_time,
					endDateTime: activity.end_time,
					location: "기본 위치",
					notes: activity.description,
					createdAt: activity.created_at,
					updatedAt: activity.updated_at,
				},
				image: imageData,
			});
		} catch (error) {
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	// 활동 인스턴스 삭제 함수 수정
	deleteActivityInstance: async (req, res, next) => {
		try {
			const { activityInstanceId } = req.params;

			// 트랜잭션 시작
			const result = await sequelize.transaction(async (t) => {
				const activity = await models.Activity.findByPk(activityInstanceId);
				await activity.destroy();

				const activityImage = await models.ActivityImage.findOne({
					where: { activity_id: activityInstanceId },
				});
				if (activityImage) {
					await activityImage.destroy();
				}
			});

			res.status(200).json({
				message:
					"활동 인스턴스와 관련된 모든 데이터가 성공적으로 삭제되었습니다.",
			});
		} catch (error) {
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	updateAttendance: async (req, res, next) => {
		try {
			// URL 파라미터에서 필요한 정보 추출
			const { activityId, activityInstanceId } = req.params;
			// 요청 본문에서 활동 인스턴스 데이터와 출석 정보 추출
			const { userId, instanceData, attendances, imageInfo } = req.body;

			// TODO: 실제 인증 시스템 구현 시 이 부분 수정 필요
			const currentUserId = userId || 1; // 임시 사용자 ID

			// 필수 데이터 검증
			// 활동 인스턴스 ID, 인스턴스 데이터, 출석 정보는 드시 필요
			if (!activityInstanceId || !instanceData || !attendances) {
				return res
					.status(400)
					.json({ message: "필수 데이터가 누락되었습니다." });
			}

			// 데이터베이에서 활동 인스턴스 조회
			// 존재하지 않는 인스턴스에 대한 업데이트 방지
			const activity = await models.Activity.findOne({
				where: { id: activityInstanceId },
			});
			if (!activity) {
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}

			// 활동 인스턴스 정보 업데이트
			// 프론트엔드에서 전송한 데이터로 인스턴스 정보 갱신
			await activity.update({
				start_time: instanceData.startDateTime,
				end_time: instanceData.endDateTime,
				description: instanceData.notes,
			});

			// 이미지 정보 업데이트
			if (
				imageInfo &&
				imageInfo.url &&
				imageInfo.fileName &&
				imageInfo.fileType
			) {
				// 기존 이미지 정보 조회
				const existingFile = await models.ActivityImage.findOne({
					where: { activity_id: activityInstanceId },
				});

				if (existingFile) {
					existingFile.destroy();
				}

				// 새 이미지 정보 저장
				const newImage = await models.ActivityImage.create({
					activity_id: activityInstanceId,
					name: imageInfo.fileName,
					path: imageInfo.url,
				});
			}

			// 출석 정보 업데이트
			await Promise.all(
				attendances.map(async (attendance) => {
					// 출석 기록 생성 또는 업데이트
					// 이미 존재하는 출석 기록은 업데이트, 없으면 새로 생성
					const [attendanceRecord, created] =
						await models.Attendance.findOrCreate({
							where: {
								activity_id: activityInstanceId,
								user_id: attendance.userId,
							},
							defaults: {
								attendance_status: attendance.status,
								description: attendance.note || null,
							},
						});

					if (!created) {
						await attendanceRecord.update({
							attendance_status: attendance.status,
							description: attendance.note || null,
						});
					}

					return attendanceRecord;
				})
			);

			// 클라이언트에 응답 전송
			// 업데이트된 활동 인스턴스 정보와 출석 정보를 포함
			res.status(200).json({
				message: "출석 정보가 성공적으로 수정되었습니다.",
				activityInstance: {
					id: activity.id,
					startDateTime: activity.start_time,
					endDateTime: activity.end_time,
					notes: activity.description,
				},
			});
		} catch (error) {
			// 에러 처리 및 로깅
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},
};

export default attendanceController;
