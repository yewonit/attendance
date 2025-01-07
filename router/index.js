// .env 파일에서 환경 변수를 로드합니다.
require("dotenv").config();

const express = require("express");
const router = express.Router();

// User
// User 관련 기능을 담당하는 컨트롤러입니다.
const UserCtrl = require("../controllers/modelCRUDCtrl/user/User.Ctrl.js");

// Organization
// Organization 관련 기능을 담당하는 컨트롤러입니다.
const OrganizationCtrl = require("../controllers/modelCRUDCtrl/organizationAndRole/Organization.Ctrl");
// Role 관련 기능을 담당하는 컨트롤러입니다.
const RoleCtrl = require("../controllers/modelCRUDCtrl/organizationAndRole/Role.Ctrl.js");
// UserHasRole 관련 기능을 담당하는 컨트롤러입니다.
const UserHasRoleCtrl = require("../controllers/modelCRUDCtrl/organizationAndRole/UserHasRole.Ctrl");

// Attendance
// ActivityCategory 관련 기능을 담당하는 컨트롤러입니다.
const ActivityCategoryCtrl = require("../controllers/modelCRUDCtrl/attendance/ActivityCategory.Ctrl.js");
// Activity 관련 기능을 담당하는 컨트롤러입니다.
const ActivityCtrl = require("../controllers/modelCRUDCtrl/attendance/Activity.Ctrl.js");
// ActivityInstance 관련 기능 담당하는 컨트롤러입니다.
const ActivityInstanceCtrl = require("../controllers/modelCRUDCtrl/attendance/ActivityInstance.Ctrl.js");
// Attendance 관련 기능을 담당하는 컨트롤러입니다.
const AttendanceCtrl = require("../controllers/modelCRUDCtrl/attendance/Attendance.Ctrl.js");
// AttendanceStatus 관련 기능을 담당하는 컨트롤러입니다.
const AttendanceStatusCtrl = require("../controllers/modelCRUDCtrl/attendance/AttendanceStatus.Ctrl.js");
// ActivityRecurrence 관련 기능을 담당하는 컨트롤러입니다.
const ActivityRecurrenceCtrl = require("../controllers/modelCRUDCtrl/attendance/ActivityRecurrence.Ctrl.js");
// ActivityChangeHistory 관련 기능을 담당하는 컨트롤러입니다.
const ActivityChangeHistoryCtrl = require("../controllers/modelCRUDCtrl/attendance/ActivityChangeHistory.Ctrl.js");
// ActivityStatistics 관련 기능을 담당하는 컨트롤러입니다.
const ActivityStatisticsCtrl = require("../controllers/modelCRUDCtrl/attendance/ActivityStatistics.Ctrl.js");

// File
// File 관련 기능을 담당하는 컨트롤러입니다.
const FileCtrl = require("../controllers/modelCRUDCtrl/file/File.Ctrl");
// ActivityHasFile 관련 기능을 담당하는 컨트롤러입니다.
const ActivityHasFileCtrl = require("../controllers/modelCRUDCtrl/file/ActivityHasFile.Ctrl");
// ActivityInstanceHasFile 관련 기능을 담당하는 컨트롤러입니다.
const ActivityInstanceHasFileCtrl = require("../controllers/modelCRUDCtrl/file/ActivityInstanceHasFile.Ctrl");

// Visitation
// Visitation 관련 기능을 담당하는 컨트롤러입니다.
const VisitationCtrl = require("../controllers/modelCRUDCtrl/visitation/visitation.Ctrl.js");

// ChurchOffice
const ChurchOfficeCtrl = require("../controllers/modelCRUDCtrl/churchOffice/ChurchOffice.Ctrl");
const UserHasChurchOfficeCtrl = require("../controllers/modelCRUDCtrl/churchOffice/UserHasChurchOffice.Ctrl");
const ServiceCtrl = require("../controllers/modelCRUDCtrl/service/Service.Ctrl");

// Season 관련 기능을 담당하는 컨트롤러입니다.
const SeasonCtrl = require("../controllers/modelCRUDCtrl/season/Season.Ctrl");

// UpdateCoramdeoMember 라우트
const UpdateCoramdeoMemberCtrl = require("../controllers/domainCtrl/UpdateCoramdeoMember.Ctrl");

// 라우트
// User 관련 라우트
// 이름으로 사용자를 조회하는 GET 요청을 처리합니다. (다른 :id 라우트보다 먼저 정의)
router.get("/users/name", UserCtrl.getUserByName);

// 특정 사용자를 조회하는 GET 요청을 처리합니다.
router.get("/users/:id", UserCtrl.readUser);

// 새로운 사용자를 생성하는 POST 요청을 처리합니다.
router.post("/users", UserCtrl.createUser);
// 모든 사용자를 조회하는 GET 요청을 처리합니다.
router.get("/users", UserCtrl.readUsers);
// 특정 사용자 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/users", UserCtrl.updateUser);
// 특정 사용자를 삭제하는 DELETE 요청을 처리합니다.
router.delete("/users", UserCtrl.deleteUser);
// 전화번호로 사용자 일치 여부를 확인하는 POST 요청을 처리합니다.
router.post("/users/phone-number", UserCtrl.checkUserPhoneNumber);

// Organization 관련 라우트
// 새로운 조직을 생성하는 POST 요청을 처리합니다.
router.post("/organizations", OrganizationCtrl.createOrganization);
// 모든 조직을 조회하는 GET 요청을 처리합니다.
router.get("/organizations", OrganizationCtrl.readOrganizations);
// 특정 조직을 조회하는 GET 요청을 처리합니다.
router.get("/organizations/:id", OrganizationCtrl.readOrganization);
// 특정 조직 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/organizations", OrganizationCtrl.updateOrganization);
// 특정 조직을 삭제하는 DELETE 요청을 처리합니다.
router.delete("/organizations", OrganizationCtrl.deleteOrganization);
// 조직의 모든 활동 정보를 조회하는 GET 요청을 처리합니다.
router.get(
	"/organizations/:id/activities",
	OrganizationCtrl.getOrganizationActivities
);

// Role 관련 라우트
// 새로운 역할을 생성하는 POST 요청을 처리합니다.
router.post("/roles", RoleCtrl.createRole);
// 모든 역할을 조회하는 GET 요청을 처리합니다.
router.get("/roles", RoleCtrl.readRoles);
// 특정 역할을 조회하는 GET 요청을 처리합니다.
router.get("/roles/:id", RoleCtrl.readRole);
// 특정 역할 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/roles", RoleCtrl.updateRole);
// 특정 역할을 삭제하는 DELETE 요청을 처리합니다.
router.delete("/roles", RoleCtrl.deleteRole);

// UserHasRole 관련 라우트
// 사용자와 역할을 연결하는 POST 요청을 처리합니다.
router.post("/user-has-roles", UserHasRoleCtrl.createUserHasRole);
// 모든 사용자와 역할 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get("/user-has-roles", UserHasRoleCtrl.readUserHasRoles);
// 특정 사용자와 역할 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get("/user-has-roles/:id", UserHasRoleCtrl.readUserHasRole);
// 특정 사용자와 역할 연결 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/user-has-roles", UserHasRoleCtrl.updateUserHasRole);
// 특정 사용자와 역할 연결 정보를 삭제하는 DELETE 요청을 처리합니다.
router.delete("/user-has-roles", UserHasRoleCtrl.deleteUserHasRole);

// ActivityCategory 관련 라우트
// 새로운 활동 카테고리를 생성하는 POST 요청을 처리합니다.
router.post(
	"/activity-categories",
	ActivityCategoryCtrl.createActivityCategory
);
// 모든 활동 카테고리를 조회하는 GET 요청을 처리합니다.
router.get("/activity-categories", ActivityCategoryCtrl.readActivityCategories);
// 특정 활동 카테고리를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-categories/:id",
	ActivityCategoryCtrl.readActivityCategory
);
// 특정 활동 카테고리 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/activity-categories", ActivityCategoryCtrl.updateActivityCategory);
// 특정 활동 카테고리를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-categories",
	ActivityCategoryCtrl.deleteActivityCategory
);

// Activity 관련 라우트
// 새로운 활동을 생성하는 POST 요청을 처리합니다.
router.post("/activities", ActivityCtrl.createActivity);
// 모든 활동을 조회하는 GET 요청을 처리합니다.
router.get("/activities", ActivityCtrl.readActivities);
// 특정 활동을 조회하는 GET 요청을 처리합니다.
router.get("/activities/:id", ActivityCtrl.readActivity);
// 특정 활동 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/activities", ActivityCtrl.updateActivity);
// 특정 활동을 삭제하는 DELETE 요청을 처리합니다.
router.delete("/activities", ActivityCtrl.deleteActivity);

// ActivityInstance 관련 라우트
// 새로운 활동 인스턴스를 생성하는 POST 청을 처리합니다.
router.post("/activity-instances", ActivityInstanceCtrl.createActivityInstance);
// 모든 활동 인스턴스를 조회하는 GET 요청을 처리합니다.
router.get("/activity-instances", ActivityInstanceCtrl.readActivityInstances);
// 특정 활동 인스턴스를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-instances/:id",
	ActivityInstanceCtrl.readActivityInstance
);
// 특정 활동 인스턴스 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/activity-instances", ActivityInstanceCtrl.updateActivityInstance);
// 특정 활동 인스턴스를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-instances",
	ActivityInstanceCtrl.deleteActivityInstance
);

// Attendance 관련 라우트
// 새로운 출석 정보를 생성하는 POST 요청을 처리합니다.
router.post("/attendances", AttendanceCtrl.createAttendance);
// 모든 출석 정보를 조회하는 GET 요청을 처리합니다.
router.get("/attendances", AttendanceCtrl.readAttendances);
// 특정 출석 정보를 조회하는 GET 요청을 처리합니다.
router.get("/attendances/:id", AttendanceCtrl.readAttendance);
// 특정 출석 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/attendances", AttendanceCtrl.updateAttendance);
// 특정 출석 정보를 삭제하는 DELETE 요청을 처리합니다.
router.delete("/attendances", AttendanceCtrl.deleteAttendance);

// AttendanceStatus 관련 라우트
// 새로운 출석 상태를 생성하는 POST 요청을 처리합니다.
router.post(
	"/attendance-statuses",
	AttendanceStatusCtrl.createAttendanceStatus
);
// 모든 출석 상태를 조회하는 GET 요청을 처리합니다.
router.get("/attendance-statuses", AttendanceStatusCtrl.readAttendanceStatuses);
// 특정 출석 상태를 조회하는 GET 요청을 처리합니다.
router.get(
	"/attendance-statuses/:id",
	AttendanceStatusCtrl.readAttendanceStatus
);
// 특정 출석 상태 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/attendance-statuses", AttendanceStatusCtrl.updateAttendanceStatus);
// 특정 출석 상태를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/attendance-statuses",
	AttendanceStatusCtrl.deleteAttendanceStatus
);

// ActivityRecurrence 관련 라우트
// 새로운 활동 반복 정보를 생성하는 POST 요청을 처리합니다.
router.post(
	"/activity-recurrences",
	ActivityRecurrenceCtrl.createActivityRecurrence
);
// 모든 활동 반복 정보를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-recurrences",
	ActivityRecurrenceCtrl.readActivityRecurrences
);
// 특정 활동 반복 정보를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-recurrences/:id",
	ActivityRecurrenceCtrl.readActivityRecurrence
);
// 특정 활동 반복 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put(
	"/activity-recurrences",
	ActivityRecurrenceCtrl.updateActivityRecurrence
);
// 특정 활동 반복 정보를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-recurrences",
	ActivityRecurrenceCtrl.deleteActivityRecurrence
);

// ActivityChangeHistory 관련 라우트
// 새로운 활동 변경 이력을 생성하는 POST 요청을 처리합니다.
router.post(
	"/activity-change-histories",
	ActivityChangeHistoryCtrl.createActivityChangeHistory
);
// 모든 활동 변경 이력을 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-change-histories",
	ActivityChangeHistoryCtrl.readActivityChangeHistories
);
// 특정 활동 변경 이력을 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-change-histories/:id",
	ActivityChangeHistoryCtrl.readActivityChangeHistory
);
// 특정 활동 변경 이력을 업데이트하는 PUT 요청을 처리합니다.
router.put(
	"/activity-change-histories",
	ActivityChangeHistoryCtrl.updateActivityChangeHistory
);
// 특정 활동 변경 이력을 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-change-histories",
	ActivityChangeHistoryCtrl.deleteActivityChangeHistory
);

// ActivityStatistics 관련 라우트
// 새로운 활동 통계를 생성하는 POST 요청을 처리합니다.
router.post(
	"/activity-statistics",
	ActivityStatisticsCtrl.createActivityStatistics
);
// 모든 활동 통계를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-statistics",
	ActivityStatisticsCtrl.readActivityStatistics
);
// 특정 활동 통계를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-statistics/:id",
	ActivityStatisticsCtrl.readActivityStatistics
);
// 특정 활동 통계를 업데이트하는 PUT 요청을 처리합니다.
router.put(
	"/activity-statistics",
	ActivityStatisticsCtrl.updateActivityStatistics
);
// 특정 활동 통계를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-statistics",
	ActivityStatisticsCtrl.deleteActivityStatistics
);

// File 관련 라우트
// 새로운 파일을 생성하는 POST 요청을 처리합니다.
router.post("/files", FileCtrl.createFile);
// 모든 파일을 조회하는 GET 요청을 처리합니다.
router.get("/files", FileCtrl.readFiles);
// 특정 파일을 조회하는 GET 요청을 처리합니다.
router.get("/files/:id", FileCtrl.readFile);
// 특정 파일 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/files", FileCtrl.updateFile);
// 특정 파일을 삭제하는 DELETE 요청을 처리합니다.
router.delete("/files", FileCtrl.deleteFile);

// ActivityHasFile 관련 라우트
// 활동과 파일을 연결하는 POST 요청을 처리합니다.
router.post("/activity-has-files", ActivityHasFileCtrl.createActivityHasFile);
// 모든 활동과 파일 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get("/activity-has-files", ActivityHasFileCtrl.readActivityHasFiles);
// 특정 활동과 파일 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get("/activity-has-files/:id", ActivityHasFileCtrl.readActivityHasFile);
// 특정 활동과 파일 연결 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put("/activity-has-files", ActivityHasFileCtrl.updateActivityHasFile);
// 특정 활동과 파일 연결 정보를 삭제하는 DELETE 요청을 처리합니다.
router.delete("/activity-has-files", ActivityHasFileCtrl.deleteActivityHasFile);

// ActivityInstanceHasFile 관련 라우트
// 활동 인스턴스와 파일을 연결하는 POST 요청 처리합니다.
router.post(
	"/activity-instance-has-files",
	ActivityInstanceHasFileCtrl.createActivityInstanceHasFile
);
// 모든 활동 인스턴스와 파일 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-instance-has-files",
	ActivityInstanceHasFileCtrl.readActivityInstanceHasFiles
);
// 특정 활동 인스턴스와 파일 연결 정보를 조회하는 GET 요청을 처리합니다.
router.get(
	"/activity-instance-has-files/:id",
	ActivityInstanceHasFileCtrl.readActivityInstanceHasFile
);
// 특정 활동 인스턴스와 파일 연결 정보를 업데이트하는 PUT 요청을 처리합니다.
router.put(
	"/activity-instance-has-files",
	ActivityInstanceHasFileCtrl.updateActivityInstanceHasFile
);
// 특정 활동 인스턴스와 파일 연결 정보를 삭제하는 DELETE 요청을 처리합니다.
router.delete(
	"/activity-instance-has-files",
	ActivityInstanceHasFileCtrl.deleteActivityInstanceHasFile
);

// Visitation 관련 라우트
// 방문 기록을 생성하는 POST 요청을 처리합니다.
router.post("/visitations", VisitationCtrl.createVisitation);
// 모든 방문 기록을 조회하는 GET 요청을 처리합니다.
router.get("/visitations", VisitationCtrl.readVisitations);
// 특정 방문 기록 조회하는 GET 요청을 처리합니다.
router.get("/visitations/:id", VisitationCtrl.readVisitation);
// 특정 방문 기록을 업데이트하는 PUT 요청을 처리합니다.
router.put("/visitations", VisitationCtrl.updateVisitation);
// 특정 방문 기록을 삭제하는 DELETE 요청을 처리합니다.
router.delete("/visitations", VisitationCtrl.deleteVisitation);

// Domain Controllers
// CurrentMember 관련 기능을 담당하는 컨트롤러입니다.
const CurrentMemberCtrl = require("../controllers/domainCtrl/CurrentMember.Ctrl.js");
// VisitManagement 관련 기능을 담당하는 컨트롤러입니다.
const VisitManagementCtrl = require("../controllers/domainCtrl/VisitManagement.Ctrl.js");

// DomainAttendance 관련 라우트
const DomainAttendanceCtrl = require("../controllers/domainCtrl/DomainAttendance.Ctrl.js");

// CurrentMember 관련 라우트
// 현재 회원 정보를 조회하는 GET 요청을 처리합니다.
router.get("/current-members", CurrentMemberCtrl.getMembersWithRoles);
router.post("/current-members", CurrentMemberCtrl.createMember);

// VisitManagement 관련 라우트
// 특정 인원에 대한 심방정보를 가져오는 GET 요청을 처리합니다.
router.get("/get-visit-post/:id", VisitManagementCtrl.getVisitPost);

router.post(
	"/organizations/:organizationId/activities/:activityId/attendance",
	DomainAttendanceCtrl.recordAttendance
);

// 새로운 삭제 라우트 추가
router.delete(
	"/organizations/:organizationId/activities/:activityId/instances/:activityInstanceId",
	DomainAttendanceCtrl.deleteActivityInstance
);

// 출석 기록 수정 라우트 추가
router.put(
	"/organizations/:organizationId/activities/:activityId/instances/:activityInstanceId/attendance",
	DomainAttendanceCtrl.updateAttendance
);

// 활동 인스턴스 상세 정보 조회
router.get(
	"/organizations/:organizationId/activities/:activityId/instances/:activityInstanceId",
	DomainAttendanceCtrl.getActivityInstanceDetails
);

// 조직 멤버 목록 조회
router.get(
	"/organizations/:organizationId/members",
	DomainAttendanceCtrl.getOrganizationMembers
);

// ChurchOffice 라우트
router.post("/church-offices", ChurchOfficeCtrl.createChurchOffice);
router.get("/church-offices", ChurchOfficeCtrl.readChurchOffices);
router.get("/church-offices/:id", ChurchOfficeCtrl.readChurchOffice);
router.put("/church-offices", ChurchOfficeCtrl.updateChurchOffice);
router.delete("/church-offices", ChurchOfficeCtrl.deleteChurchOffice);

// UserHasChurchOffice 라우트
router.post(
	"/user-has-church-offices",
	UserHasChurchOfficeCtrl.createUserHasChurchOffice
);
router.get(
	"/user-has-church-offices",
	UserHasChurchOfficeCtrl.readUserHasChurchOffices
);
router.get(
	"/user-has-church-offices/:id",
	UserHasChurchOfficeCtrl.readUserHasChurchOffice
);
router.put(
	"/user-has-church-offices",
	UserHasChurchOfficeCtrl.updateUserHasChurchOffice
);
router.delete(
	"/user-has-church-offices",
	UserHasChurchOfficeCtrl.deleteUserHasChurchOffice
);

// Service 라우트
router.post("/services", ServiceCtrl.createService);
router.get("/services", ServiceCtrl.readServices);
router.get("/services/:id", ServiceCtrl.readService);
router.put("/services", ServiceCtrl.updateService);
router.delete("/services", ServiceCtrl.deleteService);

// Season 라우트
router.post("/seasons", SeasonCtrl.createSeason);
router.get("/seasons", SeasonCtrl.readSeasons);
router.get("/seasons/:id", SeasonCtrl.readSeason);
router.put("/seasons", SeasonCtrl.updateSeason);
router.delete("/seasons", SeasonCtrl.deleteSeason);

// UpdateCoramdeoMember 라우트
router.post(
	"/update-coramdeo-members",
	UpdateCoramdeoMemberCtrl.bulkUpdateMembers
);

// 설정된 라우터 모듈을 내보냅니다.
module.exports = router;
