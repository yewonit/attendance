// Organization.Ctrl.js

import models from "../../../models/models";
import crudService from "../common/crud.js";

// 📝 조직 정보 유효성 검사 함수
const validateOrganizationData = async (data) => {
	if (!data.organization_name) {
		const error = new Error("조직 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.organization_code) {
		const error = new Error("조직 코드가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// ✅ 추가 유효성 검사 로직
	// 추가적인 유효성 검사 로직을 구현할 수 있습니다.
};

// 📦 조직 관련 컨트롤러 모듈
const organizationService = {
	// ✨ 조직 생성
	createOrganization: crudService.create(
		models.Organization,
		validateOrganizationData
	),

	// 📖 전체 조직 조회
	findOrganizations: crudService.findAll(models.Organization),

	// 🔍 특정 조직 조회
	findOrganization: crudService.findOne(models.Organization),

	// ✏️ 조직 정보 업데이트
	updateOrganization: crudService.update(
		models.Organization,
		validateOrganizationData
	),

	// 🗑️ 조직 삭제
	deleteOrganization: crudService.delete(models.Organization),

	// 🎨 추가 조직 관련 기능 예시
	// 여기에 추가적인 조직 관련 기능을 구현할 수 있습니다.

	// organizationController 객체에 새로운 메서드를 추가합니다:
	getOrganizationActivities: async (req, res, next) => {
		console.log("🚀 getOrganizationActivities 함수 시작");
		try {
			const organizationId = req.params.id;
			console.log(`🏢 조직 ID: ${organizationId}`);

			if (!organizationId) {
				throw new Error("조직 ID가 제공되지 않았습니다.");
			}

			console.log("🔍 데이터베이스에서 조직 정보 조회 중...");
			const organization = await models.Organization.findByPk(organizationId, {
				include: [
					{
						model: models.Activity,
						include: [
							models.ActivityCategory,
							{
								model: models.ActivityInstance,
								include: [
									{
										model: models.Attendance,
										include: [
											{
												model: models.User,
												attributes: ["id", "name", "email", "phone_number"],
											},
											models.AttendanceStatus,
										],
									},
									// 이미지 파일 정보를 포함
									{
										model: models.File,
										as: "Images",
										attributes: [
											"id",
											"file_name",
											"file_path",
											"file_type",
											"file_size",
										],
									},
								],
							},
						],
					},
				],
			});
			console.log("✅ 조직 정보 조회 완료");

			if (!organization) {
				throw new Error(
					`ID ${organizationId}에 해당하는 조직을 찾을 수 없습니다.`
				);
			}

			console.log("🔄 활동 데이터 매핑 시작");
			const activitiesData = organization.Activities.map((activity) => {
				console.log(`📊 활동 처리 중: ${activity.name}`);
				return {
					id: activity.id,
					name: activity.name,
					description: activity.description,
					category: activity.ActivityCategory
						? activity.ActivityCategory.name
						: null,
					instances: activity.ActivityInstances.map((instance) => {
						console.log(`🕒 인스턴스 처리 중: ID ${instance.id}`);
						return {
							id: instance.id,
							activity_id: instance.activity_id,
							parent_instance_id: instance.parent_instance_id,
							start_datetime: instance.start_datetime,
							end_datetime: instance.end_datetime,
							actual_location: instance.actual_location,
							actual_online_link: instance.actual_online_link,
							notes: instance.notes,
							attendance_count: instance.attendance_count,
							is_canceled: instance.is_canceled,
							created_at: instance.created_at,
							updated_at: instance.updated_at,
							creator_id: instance.creator_id,
							updater_id: instance.updater_id,
							attendances: instance.Attendances.map((attendance) => {
								console.log(
									`👤 출석 정보 처리 중: 사용자 ${attendance.User.name}`
								);
								return {
									userId: attendance.User.id,
									userName: attendance.User.name,
									userEmail: attendance.User.email,
									userPhoneNumber: attendance.User.phone_number,
									status: attendance.AttendanceStatus
										? attendance.AttendanceStatus.name
										: null,
									check_in_time: attendance.check_in_time,
									check_out_time: attendance.check_out_time,
									note: attendance.note,
								};
							}),
							images: instance.Images.map((image) => ({
								id: image.id,
								fileName: image.file_name,
								filePath: image.file_path,
								fileType: image.file_type,
								fileSize: image.file_size,
							})),
						};
					}),
				};
			});
			console.log("✅ 활동 데이터 매핑 완료");

			console.log("📤 응답 전송 준비");
			res.json({
				organizationId: organization.id,
				organizationName: organization.organization_name,
				activities: activitiesData,
			});
			console.log("✅ 응답 전송 완료");
		} catch (error) {
			console.error("❌ getOrganizationActivities 에러 발생:", error);
			console.error("스택 트레이스:", error.stack);

			// 에러 유형에 따른 상세 메시지 설정
			let errorMessage = "서버 오류가 발생했습니다.";
			let statusCode = 500;

			if (error.message.includes("조직 ID가 제공되지 않았습니다")) {
				errorMessage = "조직 ID가 필요합니다.";
				statusCode = 400;
			} else if (error.message.includes("조직을 찾을 수 없습니다")) {
				errorMessage = "요청한 조직을 찾을 수 없습니다.";
				statusCode = 404;
			}

			// 프론트엔드로 상세한 에러 정보 전송
			res.status(statusCode).json({
				message: errorMessage,
				error: error.message,
				stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
				timestamp: new Date().toISOString(),
				path: req.originalUrl,
			});
		}
		console.log("🏁 getOrganizationActivities 함수 종료");
	},
};

// 📤 모듈 내보내기
export default organizationService;
