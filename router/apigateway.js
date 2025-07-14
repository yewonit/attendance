import { Router } from "express";
import activityRouter from "./attendance/activity.js";
import activityCategoryRouter from "./attendance/activity_category.js";
import activityInstanceRouter from "./attendance/activity_instance.js";
import attendanceRouter from "./attendance/attendance.js";
import attendanceStatusRouter from "./attendance/attendance_status.js";
import activityHasFileRouter from "./file/activity_has_file.js";
import activityInstanceHasFileRouter from "./file/activity_instance_has_file.js";
import fileRouter from "./file/file.js";
import organizationRouter from "./organization/organization.js";
import roleRouter from "./role/role.js";
import userHasRoleRouter from "./role/user_has_role.js";
import seasonRouter from "./season/season.js";
import userRouter from "./user/user.js";

import CoramdeoController from "./domainCtrl/Coramdeo.Ctrl.js";
import CurrentMemberCtrl from "./domainCtrl/CurrentMember.Ctrl.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 유저 관리 API
 */
router.use("/users", userRouter);

/**
 * @swagger
 * tags:
 *   name: Activity Categories
 *   description: 활동 카테고리 관리 API
 */
router.use("/activity-categories", activityCategoryRouter);

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: 활동 관리 API
 */
router.use("/activities", activityRouter);

/**
 * @swagger
 * tags:
 *   name: Activity Instances
 *   description: 활동 인스턴스 관리 API
 */
router.use("/activity-instances", activityInstanceRouter);

/**
 * @swagger
 * tags:
 *   name: Attendances
 *   description: 출석 관리 API
 */
router.use("/attendances", attendanceRouter);

/**
 * @swagger
 * tags:
 *   name: Attendance Statuses
 *   description: 출석 상태 값 관리 API
 */
router.use("/attendance-statuses", attendanceStatusRouter);

/**
 * @swagger
 * tags:
 *   name: Activity Files
 *   description: 활동 - 파일 관리 API
 */
router.use("/activity-has-files", activityHasFileRouter);

/**
 * @swagger
 * tags:
 *   name: Activity Instance Files
 *   description: 활동 인스턴스 파일 관리 API
 */
router.use("/activity-instance-has-files", activityInstanceHasFileRouter);

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: 파일 관리 API
 */
router.use("/files", fileRouter);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: 조직 관리 API
 */
router.use("/organizations", organizationRouter);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: 역할 (그룹장, 순장 등) 관리 API
 */
router.use("/roles", roleRouter);

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: 유저 - 역할 관리 API
 */
router.use("/user-has-roles", userHasRoleRouter);

/**
 * @swagger
 * tags:
 *   name: Seasons
 *   description: 시즌 관리 API
 */
router.use("/seasons", seasonRouter);

/**
 * @swagger
 * /api/current-members:
 *   get:
 *     summary: 현재 회원 목록 조회
 *     description: 현재 회원들의 정보와 역할을 함께 조회합니다.
 *     tags: [Current Members]
 *     responses:
 *       200:
 *         description: 성공적으로 회원 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.get("/current-members", CurrentMemberCtrl.getMembersWithRoles);

/**
 * @swagger
 * /api/current-members:
 *   post:
 *     summary: 새로운 회원 생성
 *     description: 새로운 회원을 생성합니다.
 *     tags: [Current Members]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: 성공적으로 회원이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.post("/current-members", CurrentMemberCtrl.createMember);

/**
 * @swagger
 * /api/coramdeo/members:
 *   post:
 *     summary: 코람데오 회원 정보 업데이트
 *     description: 코람데오 회원의 정보를 업데이트합니다.
 *     tags: [Coramdeo]
 *     responses:
 *       200:
 *         description: 성공적으로 회원 정보가 업데이트되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.post("/coramdeo/members", CoramdeoController.updateCoramdeoMember);

/**
 * @swagger
 * /api/coramdeo/activities:
 *   post:
 *     summary: 회기별 코람데오 활동 초기화
 *     description: 회기별 코람데오 활동을 초기화합니다.
 *     tags: [Coramdeo]
 *     responses:
 *       200:
 *         description: 성공적으로 활동이 초기화되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */
router.post("/coramdeo/activities", CoramdeoController.initCoramdeoActivities);

// 설정된 라우터 모듈을 내보냅니다.
export default router;
