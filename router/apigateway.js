import { Router } from "express"
const router = Router();


const UserCtrl = require("../services/user/user.js");
const OrganizationCtrl = require("../services/organization/organization.js");
const RoleCtrl = require("../services/role/role.js");
const UserHasRoleCtrl = require("../services/role/user_has_role.js");
const ActivityCategoryCtrl = require("../services/attendance/activity_category.js");
const ActivityCtrl = require("../services/attendance/activity.js");
const ActivityInstanceCtrl = require("../services/attendance/activity_instance.js");
const AttendanceCtrl = require("../services/attendance/attendance.js");
const AttendanceStatusCtrl = require("../services/attendance/attendance_status.js");
const ActivityChangeHistoryCtrl = require("../services/attendance/activity_change_history.js");
const FileCtrl = require("../services/file/file.js");
const ActivityHasFileCtrl = require("../services/file/activity_has_file.js");
const ActivityInstanceHasFileCtrl = require("../services/file/activity_instance_has_file.js");
const VisitationCtrl = require("../services/visitation/visitation.js");
const ChurchOfficeCtrl = require("../services/churchOffice/church_office.js");
const UserHasChurchOfficeCtrl = require("../services/churchOffice/user_has_church_office.js");
const SeasonCtrl = require("../services/season/season.js");

const CoramdeoController = require("../controllers/domainCtrl/Coramdeo.Ctrl.js");
const CurrentMemberCtrl = require("../controllers/domainCtrl/CurrentMember.Ctrl.js");
const VisitManagementCtrl = require("../controllers/domainCtrl/VisitManagement.Ctrl.js");
const DomainAttendanceCtrl = require("../controllers/domainCtrl/DomainAttendance.Ctrl.js");

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
router.post(
	"/activity-instances/necessary",
	ActivityInstanceCtrl.createActivityInstanceByNecessary
);
router.patch(
	"/activity-instances/necessary/:id",
	ActivityInstanceCtrl.updateActivityInstanceByNecessary
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

// Season 라우트
router.post("/seasons", SeasonCtrl.createSeason);
router.get("/seasons", SeasonCtrl.readSeasons);
router.get("/seasons/:id", SeasonCtrl.readSeason);
router.put("/seasons", SeasonCtrl.updateSeason);
router.delete("/seasons", SeasonCtrl.deleteSeason);

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

router.post("/coramdeo/members", CoramdeoController.updateCoramdeoMember);

router.post("/coramdeo/activities", CoramdeoController.initCoramdeoActivities);

// /health-check API 추가
router.get('/health-check', (req, res) => {
    res.status(200).send('OK');
});

// 설정된 라우터 모듈을 내보냅니다.
export default router;
