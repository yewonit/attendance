import { col, fn, where } from "sequelize";
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
				console.log("❌ 필수 데이터 누락");
				return res
					.status(400)
					.json({ message: "필수 데이터가 누락되었습니다." });
			}

			// instanceData 필드 검증
			if (!instanceData.startDateTime || !instanceData.endDateTime) {
				console.log("❌ 시작 시간 또는 종료 시간 누락");
				return res
					.status(400)
					.json({ message: "시작 시간과 종료 시간은 필수입니다." });
			}

			// 조직이 존재하는지 확인
			const organization = await models.Organization.findByPk(organizationId);
			if (!organization) {
				console.log("❌ 조직을 찾을 수 없음");
				return res.status(404).json({ message: "조직을 찾을 수 없습니다." });
			}

			// 활동이 존재하는지 확인
			const activity = await models.Activity.findOne({
				where: { id: activityId, organization_id: organizationId },
			});
			if (!activity) {
				console.log("❌ 해당 조직의 활동을 찾을 수 없음");
				return res
					.status(404)
					.json({ message: "해당 조직의 활동을 찾을 수 없습니다." });
			}

			// 활동 인스턴스 생성
			const activityInstance = await models.ActivityInstance.create({
				activity_id: activityId,
				start_datetime: instanceData.startDateTime,
				end_datetime: instanceData.endDateTime,
				actual_location: instanceData.location || "기본 위치",
				notes: instanceData.notes || "",
				creator_id: currentUserId,
				updater_id: currentUserId,
			});

			// 파일 정보 저장
			let fileData = null; // fileData 변수를 미리 선언

			if (
				imageInfo &&
				typeof imageInfo === "object" &&
				imageInfo.url &&
				imageInfo.fileName &&
				imageInfo.fileType
			) {
				try {
					fileData = await models.File.create({
						file_for: "AI",
						file_name: imageInfo.fileName,
						file_path: imageInfo.url,
						file_size: imageInfo.fileSize
							? `${imageInfo.fileSize} bytes`
							: "0 bytes",
						file_type: imageInfo.fileType,
						creator_id: currentUserId,
						updater_id: currentUserId,
						creator_ip: req.ip,
						updater_ip: req.ip,
					});

					if (fileData) {
						const activityInstanceHasFile =
							await models.ActivityInstanceHasFile.create({
								activity_instance_id: activityInstance.id,
								file_id: fileData.id,
								creator_id: currentUserId,
								updater_id: currentUserId,
								creator_ip: req.ip,
								updater_ip: req.ip,
							});
					}
				} catch (fileError) {
					console.error("❌ 파일 정보 저장 중 오류 발생:", fileError);
					console.error("오류 상세 정보:", JSON.stringify(fileError, null, 2));
				}
			} else {
				console.log("❗ 유효한 이미지 정보가 제공되지 않았습니다.");
				console.log("imageInfo 유효성 검사 결과:");
				console.log("- imageInfo 존재 여부:", !!imageInfo);
				console.log(
					"- imageInfo가 객체인지:",
					typeof imageInfo === "object" && imageInfo !== null
				);
				console.log("- url 존재 여부:", imageInfo && imageInfo.url);
				console.log("- fileName 존재 여부:", imageInfo && imageInfo.fileName);
				console.log("- fileType 존재 여부:", imageInfo && imageInfo.fileType);
			}

			// 출석 정보 생성 또는 업데이트
			const updatedAttendances = await Promise.all(
				attendances.map(async (attendance) => {
					const attendanceStatus = await models.AttendanceStatus.findOne({
						where: where(
							fn("LOWER", col("name")),
							fn("LOWER", attendance.status)
						),
					});
					if (!attendanceStatus) {
						console.log(`❌ 유효하지 않은 출석 상태: ${attendance.status}`);
						console.log("데이터베이스에 존재하는 상태들:");
						const allStatuses = await models.AttendanceStatus.findAll();
						console.log(allStatuses.map((status) => status.name));
						throw new Error(`유효하지 않은 출석 상태: ${attendance.status}`);
					}

					const [attendanceRecord, created] =
						await models.Attendance.findOrCreate({
							where: {
								activity_instance_id: activityInstance.id,
								user_id: attendance.userId,
							},
							defaults: {
								attendance_status_id: attendanceStatus.id,
								check_in_time: attendance.checkInTime || null,
								check_out_time: attendance.checkOutTime || null,
								note: attendance.note || "",
								attendance_role: "PARTICIPANT", // 기본 역할 설정
								creator_id: currentUserId,
								updater_id: currentUserId,
							},
						});

					if (!created) {
						await attendanceRecord.update({
							attendance_status_id: attendanceStatus.id,
							check_in_time: attendance.checkInTime || null,
							check_out_time: attendance.checkOutTime || null,
							note: attendance.note || attendanceRecord.note,
							updater_id: currentUserId,
						});
					} else {
						console.log("✨ 새 출석 정보 생성");
					}

					return attendanceRecord;
				})
			);

			// 활동 인스턴스의 출석 수 업데이트
			await activityInstance.update({
				attendance_count: updatedAttendances.length,
				updater_id: currentUserId,
			});

			res.status(200).json({
				message: "출석 정보가 성공적으로 기록되었습니다.",
				activityInstance: {
					id: activityInstance.id,
					startDateTime: activityInstance.start_datetime,
					endDateTime: activityInstance.end_datetime,
					location: activityInstance.actual_location,
					notes: activityInstance.notes,
				},
				attendances: await Promise.all(
					updatedAttendances.map(async (attendance) => {
						const attendanceStatus = await models.AttendanceStatus.findByPk(
							attendance.attendance_status_id
						);
						return {
							id: attendance.id,
							userId: attendance.user_id,
							status: attendanceStatus ? attendanceStatus.name : "출석",
							checkInTime: attendance.check_in_time,
							checkOutTime: attendance.check_out_time,
							note: attendance.note,
						};
					})
				),
				file: fileData
					? {
							id: fileData.id,
							fileName: fileData.file_name,
							filePath: fileData.file_path,
							fileSize: fileData.file_size,
							fileType: fileData.file_type,
					  }
					: null,
			});
		} catch (error) {
			console.error("❌ Error in recordAttendance:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	// 활동 인스턴스 삭제 함수 수정
	deleteActivityInstance: async (req, res, next) => {
		console.log("🚀 활동 인스턴스 삭제 프로세스 시작");
		try {
			const { organizationId, activityId, activityInstanceId } = req.params;

			// 트랜잭션 시작
			const result = await sequelize.transaction(async (t) => {
				// 1. ActivityInstanceHasFile 조회 및 삭제
				const activityInstanceFiles =
					await models.ActivityInstanceHasFile.findAll({
						where: { activity_instance_id: activityInstanceId },
						transaction: t,
					});

				// 파일 ID 목록 추출
				const fileIds = activityInstanceFiles.map((file) => file.file_id);

				// ActivityInstanceHasFile 레코드 삭제
				await models.ActivityInstanceHasFile.destroy({
					where: { activity_instance_id: activityInstanceId },
					transaction: t,
				});

				// 2. File 테이블에서 관련 파일 데이터 삭제
				await models.File.destroy({
					where: { id: fileIds },
					transaction: t,
				});

				// 3. Attendance 레코드 삭제
				await models.Attendance.destroy({
					where: { activity_instance_id: activityInstanceId },
					transaction: t,
				});

				// 4. ActivityInstance 삭제
				const deletedActivityInstance = await models.ActivityInstance.destroy({
					where: {
						id: activityInstanceId,
						activity_id: activityId,
					},
					transaction: t,
				});

				if (deletedActivityInstance === 0) {
					throw new Error("활동 인스턴스를 찾을 수 없습니다.");
				}

				return { deletedActivityInstance, deletedFileIds: fileIds };
			});

			console.log("✅ 활동 인스턴스 및 관련 데이터 삭제 완료");
			res.status(200).json({
				message:
					"활동 인스턴스와 관련된 모든 데이터가 성공적으로 삭제되었습니다.",
				deletedActivityInstanceId: activityInstanceId,
				deletedFileIds: result.deletedFileIds,
			});
		} catch (error) {
			console.error("❌ Error in deleteActivityInstance:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	/**
	 * 출석 기록을 업데이트하는 함수
	 *
	 * 이 함수는 활동 인스턴스의 정보와 참석자들의 출석 상태를 동시에 업데이트합니다.
	 * 데이터 모델 구조:
	 * - ActivityInstance: 특정 날짜에 실제로 진행된 활동의 인스턴스
	 * - Attendance: 각 사용자의 특정 활동 인스턴스에 대한 출석 정보
	 * - AttendanceStatus: 출석 상태 (예: 출석, 결석, 지각 등)를 정의
	 *
	 * @param {Object} req - Express 요청 객체
	 * @param {Object} res - Express 응답 객체
	 * @param {Function} next - Express 다음 미들웨어 함수
	 */
	updateAttendance: async (req, res, next) => {
		console.log("🚀 출석 기록 수정 프로세스 시작");
		try {
			// URL 파라미터에서 필요한 정보 추출
			const { organizationId, activityId, activityInstanceId } = req.params;
			// 요청 본문에서 활동 인스턴스 데이터와 출석 정보 추출
			const { userId, instanceData, attendances, imageInfo } = req.body;

			// TODO: 실제 인증 시스템 구현 시 이 부분 수정 필요
			const currentUserId = userId || 1; // 임시 사용자 ID

			// 받은 데이터 로깅 (디버깅 및 모니터링 목적)
			console.log("📦 받은 데이터:");
			console.log("- 파라미터:", {
				organizationId,
				activityId,
				activityInstanceId,
			});
			console.log("- instanceData:", JSON.stringify(instanceData, null, 2));
			console.log("- attendances:", JSON.stringify(attendances, null, 2));
			console.log("- imageInfo:", JSON.stringify(imageInfo, null, 2));

			// 필수 데이터 검증
			// 활동 인스턴스 ID, 인스턴스 데이터, 출석 정보는 드시 필요
			if (!activityInstanceId || !instanceData || !attendances) {
				console.log("❌ 필수 데이터 누락");
				return res
					.status(400)
					.json({ message: "필수 데이터가 누락되었습니다." });
			}

			// 데이터베이에서 활동 인스턴스 조회
			// 존재하지 않는 인스턴스에 대한 업데이트 방지
			const activityInstance = await models.ActivityInstance.findOne({
				where: { id: activityInstanceId, activity_id: activityId },
			});
			if (!activityInstance) {
				console.log("❌ 활동 인스턴스를 찾을 수 없음");
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}

			// 활동 인스턴스 정보 업데이트
			// 프론트엔드에서 전송한 데이터로 인스턴스 정보 갱신
			console.log("📝 활동 인스턴스 정보 업데이트 중...");
			await activityInstance.update({
				start_datetime: instanceData.startDateTime,
				end_datetime: instanceData.endDateTime,
				actual_location:
					instanceData.location || activityInstance.actual_location,
				notes: instanceData.notes || activityInstance.notes,
				updater_id: currentUserId,
			});
			console.log("✅ 활동 인스턴스 정보 업데이트 완료");

			// 이미지 정보 업데이트
			if (
				imageInfo &&
				imageInfo.url &&
				imageInfo.fileName &&
				imageInfo.fileType
			) {
				console.log("🖼️ 이미지 정보 업데이트 중...");

				// 기존 이미지 정보 조회
				const existingFile = await models.ActivityInstanceHasFile.findOne({
					where: { activity_instance_id: activityInstanceId },
					include: [{ model: models.File }],
				});

				if (existingFile) {
					// 기존 이미지 삭제 (AWS S3 삭제 로직 추가 필요)
					await models.File.destroy({ where: { id: existingFile.File.id } });
					await models.ActivityInstanceHasFile.destroy({
						where: { id: existingFile.id },
					});
				}

				// 새 이미지 정보 저장
				const newFile = await models.File.create({
					file_for: "AI",
					file_name: imageInfo.fileName,
					file_path: imageInfo.url,
					file_size: imageInfo.fileSize
						? `${imageInfo.fileSize} bytes`
						: "0 bytes",
					file_type: imageInfo.fileType,
					creator_id: currentUserId,
					updater_id: currentUserId,
					creator_ip: req.ip,
					updater_ip: req.ip,
				});

				await models.ActivityInstanceHasFile.create({
					activity_instance_id: activityInstanceId,
					file_id: newFile.id,
					creator_id: currentUserId,
					updater_id: currentUserId,
					creator_ip: req.ip,
					updater_ip: req.ip,
				});

				console.log("✅ 이미지 정보 업데이트 완료");
			}

			// 출석 정보 업데이트
			console.log("📊 출석 정보 업데이트 중...");
			const updatedAttendances = await Promise.all(
				attendances.map(async (attendance) => {
					console.log(`👤 사용자 출석 처리 (userId: ${attendance.userId}):`);
					console.log(JSON.stringify(attendance, null, 2));

					// 출석 상태 확인 (대소문자 구분 없이)
					// AttendanceStatus 테이블에서 해당하는 상태 조회
					const attendanceStatus = await models.AttendanceStatus.findOne({
						where: where(
							fn("LOWER", col("name")),
							fn("LOWER", attendance.status)
						),
					});
					if (!attendanceStatus) {
						console.log(`❌ 유효하지 않은 출석 상태: ${attendance.status}`);
						throw new Error(`유효하지 않은 출석 상태: ${attendance.status}`);
					}

					// 출석 기록 생성 또는 업데이트
					// 이미 존재하는 출석 기록은 업데이트, 없으면 새로 생성
					const [attendanceRecord, created] =
						await models.Attendance.findOrCreate({
							where: {
								activity_instance_id: activityInstanceId,
								user_id: attendance.userId,
							},
							defaults: {
								attendance_status_id: attendanceStatus.id,
								check_in_time: attendance.checkInTime,
								check_out_time: attendance.checkOutTime,
								note: attendance.note || "",
								attendance_role: "PARTICIPANT", // 기본 역할 설정
								creator_id: currentUserId,
								updater_id: currentUserId,
							},
						});

					if (!created) {
						console.log("🔄 기존 출석 정보 업데이트");
						await attendanceRecord.update({
							attendance_status_id: attendanceStatus.id,
							check_in_time: attendance.checkInTime,
							check_out_time: attendance.checkOutTime,
							note: attendance.note || attendanceRecord.note,
							updater_id: currentUserId,
						});
					} else {
						console.log("✨ 새 출석 정보 생성");
					}

					return attendanceRecord;
				})
			);
			console.log("✅ 출석 정보 업데이트 완료");

			// 활동 인스턴스의 총 출석 수 업데이트
			console.log("🔢 출석 수 업데이트 중...");
			await activityInstance.update({
				attendance_count: updatedAttendances.length,
				updater_id: currentUserId,
			});
			console.log("✅ 출석 수 업데이트 완료");

			console.log("🎉 출석 기록 수정 프로세스 완료");

			// 응답에 이미지 정보 추가
			const updatedImageInfo = await models.ActivityInstanceHasFile.findOne({
				where: { activity_instance_id: activityInstanceId },
				include: [{ model: models.File }],
			});

			// 클라이언트에 응답 전송
			// 업데이트된 활동 인스턴스 정보와 출석 정보를 포함
			res.status(200).json({
				message: "출석 정보가 성공적으로 수정되었습니다.",
				activityInstance: {
					id: activityInstance.id,
					startDateTime: activityInstance.start_datetime,
					endDateTime: activityInstance.end_datetime,
					location: activityInstance.actual_location,
					notes: activityInstance.notes,
				},
				attendances: await Promise.all(
					updatedAttendances.map(async (attendance) => {
						const attendanceStatus = await models.AttendanceStatus.findByPk(
							attendance.attendance_status_id
						);
						return {
							id: attendance.id,
							userId: attendance.user_id,
							status: attendanceStatus ? attendanceStatus.name : "출석",
							checkInTime: attendance.check_in_time,
							checkOutTime: attendance.check_out_time,
							note: attendance.note,
						};
					})
				),
				image: updatedImageInfo
					? {
							id: updatedImageInfo.File.id,
							fileName: updatedImageInfo.File.file_name,
							filePath: updatedImageInfo.File.file_path,
							fileSize: updatedImageInfo.File.file_size,
							fileType: updatedImageInfo.File.file_type,
					  }
					: null,
			});
		} catch (error) {
			// 에러 처리 및 로깅
			console.error("❌ Error in updateAttendance:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	// 활동 인스턴스 상세 정보 조회
	getActivityInstanceDetails: async (req, res, next) => {
		console.log("🚀 활동 인스턴스 상세 정보 조회 시작");
		try {
			const { organizationId, activityId, activityInstanceId } = req.params;

			const activityInstance = await models.ActivityInstance.findOne({
				where: { id: activityInstanceId, activity_id: activityId },
				include: [
					{
						model: models.Activity,
						where: { organization_id: organizationId },
						attributes: ["name", "description"],
					},
					{
						model: models.Attendance,
						include: [
							{
								model: models.User,
								attributes: ["id", "name", "email"],
							},
							{
								model: models.AttendanceStatus,
								attributes: ["name"],
							},
						],
					},
					{
						model: models.ActivityInstanceHasFile,
						include: [
							{
								model: models.File,
								attributes: [
									"id",
									"file_name",
									"file_path",
									"file_size",
									"file_type",
								],
							},
						],
					},
				],
			});

			if (!activityInstance) {
				console.log("❌ 활동 인스턴스를 찾을 수 없음");
				return res
					.status(404)
					.json({ message: "활동 인스턴스를 찾을 수 없습니다." });
			}

			console.log("✅ 활동 인스턴스 상세 정보 조회 완료");
			res.status(200).json({
				activityInstance: {
					id: activityInstance.id,
					startDateTime: activityInstance.start_datetime,
					endDateTime: activityInstance.end_datetime,
					location: activityInstance.actual_location,
					notes: activityInstance.notes,
					activityName: activityInstance.Activity.name,
					activityDescription: activityInstance.Activity.description,
					attendances: activityInstance.Attendances.map((attendance) => ({
						id: attendance.id,
						userId: attendance.User.id,
						userName: attendance.User.name,
						userEmail: attendance.User.email,
						status: attendance.AttendanceStatus.name,
						checkInTime: attendance.check_in_time,
						checkOutTime: attendance.check_out_time,
						note: attendance.note,
					})),
					images: activityInstance.ActivityInstanceHasFiles.map(
						(fileAssociation) => ({
							id: fileAssociation.File.id,
							fileName: fileAssociation.File.file_name,
							filePath: fileAssociation.File.file_path,
							fileSize: fileAssociation.File.file_size,
							fileType: fileAssociation.File.file_type,
						})
					),
				},
			});
		} catch (error) {
			console.error("❌ Error in getActivityInstanceDetails:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},

	// 조직 멤버 목록 조회
	getOrganizationMembers: async (req, res, next) => {
		console.log("🚀 조직 멤버 목록 조회 시작");
		try {
			const { organizationId } = req.params;

			const organizationMembers = await models.UserHasRole.findAll({
				where: {
					organization_id: organizationId,
					is_deleted: "N",
				},
				include: [
					{
						model: models.User,
						attributes: ["id", "name", "email"],
						where: { is_deleted: "N" },
					},
					{
						model: models.Role,
						attributes: ["id", "role_name"],
					},
				],
			});

			console.log("✅ 조직 멤버 목록 조회 완료");
			res.status(200).json({
				members: organizationMembers.map((member) => ({
					id: member.User.id,
					name: member.User.name,
					email: member.User.email,
					roleId: member.Role.id,
					roleName: member.Role.role_name,
					roleStartDate: member.role_start_date,
					roleEndDate: member.role_end_date,
				})),
			});
		} catch (error) {
			console.error("❌ Error in getOrganizationMembers:", error);
			res.status(500).json({
				message: "서버 오류가 발생했습니다.",
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
			});
		}
	},
};

export default attendanceController;
