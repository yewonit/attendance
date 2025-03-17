import { Router } from "express";
import activityRouter from "./attendance/activity.js";
import activityCategoryRouter from "./attendance/activity_category.js";
import activityChangeHistoryRouter from "./attendance/activity_change_history.js";
import activityInstanceRouter from "./attendance/activity_instance.js";
import attendanceRouter from "./attendance/attendance.js";
import attendanceStatusRouter from "./attendance/attendance_status.js";
import churchOfficeRouter from "./churchOffice/church_office.js";
import userHasChurchOfficeRouter from "./churchOffice/user_has_church_office.js";
import activityHasFileRouter from "./file/activity_has_file.js";
import activityInstanceHasFileRouter from "./file/activity_instance_has_file.js";
import fileRouter from "./file/file.js";
import organizationRouter from "./organization/organization.js";
import roleRouter from "./role/role.js";
import userHasRoleRouter from "./role/user_has_role.js";
import seasonRouter from "./season/season.js";
import userRouter from "./user/user.js";
import visitationRouter from "./visitation/visitation.js";
const router = Router();

import OrganizationCtrl from "../services/organization/organization.js";

import CoramdeoController from "./domainCtrl/Coramdeo.Ctrl.js";
import CurrentMemberCtrl from "./domainCtrl/CurrentMember.Ctrl.js";
import DomainAttendanceCtrl from "./domainCtrl/DomainAttendance.Ctrl.js";

router.use("/users", userRouter);
router.use("/activity-categories", activityCategoryRouter);
router.use("/activities", activityRouter);
router.use("/activity-change-histories", activityChangeHistoryRouter);
router.use("/activity-instances", activityInstanceRouter);
router.use("/attendances", attendanceRouter);
router.use("/attendance-statuses", attendanceStatusRouter);
router.use("/church-offices", churchOfficeRouter);
router.use("/user-has-church-offices", userHasChurchOfficeRouter);
router.use("/activity-has-files", activityHasFileRouter);
router.use("/activity-instance-has-files", activityInstanceHasFileRouter);
router.use("/files", fileRouter);
router.use("/organizations", organizationRouter);
router.use("/roles", roleRouter);
router.use("/user-has-roles", userHasRoleRouter);
router.use("/seasons", seasonRouter);
router.use("/visitations", visitationRouter);

router.get(
	"/organizations/:id/activities",
	OrganizationCtrl.getOrganizationActivities
);

// CurrentMember 관련 라우트
// 현재 회원 정보를 조회하는 GET 요청을 처리합니다.
router.get("/current-members", CurrentMemberCtrl.getMembersWithRoles);
router.post("/current-members", CurrentMemberCtrl.createMember);

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

// 설정된 라우터 모듈을 내보냅니다.
export default router;
