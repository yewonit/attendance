import { Router } from "express";
import activityRouter from "./activity/activity.js";
import attendanceRouter from "./attendance/attendance.js";
import CurrentMemberCtrl from "./domainCtrl/CurrentMember.Ctrl.js";
import organizationRouter from "./organization/organization.js";
import userRouter from "./user/user.js";

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
 *   name: Activities
 *   description: 활동 관리 API
 */
router.use("/activities", activityRouter);

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
 *   name: Attendances
 *   description: 출석 집계
 */
router.use("/attendances", attendanceRouter);

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

// 설정된 라우터 모듈을 내보냅니다.
export default router;
