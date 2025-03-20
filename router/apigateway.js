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



import CoramdeoController from "./domainCtrl/Coramdeo.Ctrl.js";
import CurrentMemberCtrl from "./domainCtrl/CurrentMember.Ctrl.js";


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

// CurrentMember 관련 라우트
// 현재 회원 정보를 조회하는 GET 요청을 처리합니다.
router.get("/current-members", CurrentMemberCtrl.getMembersWithRoles);
router.post("/current-members", CurrentMemberCtrl.createMember);

router.post("/coramdeo/members", CoramdeoController.updateCoramdeoMember);

router.post("/coramdeo/activities", CoramdeoController.initCoramdeoActivities);

// 설정된 라우터 모듈을 내보냅니다.
export default router;
