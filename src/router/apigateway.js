import { Router } from "express";
import activityRouter from "./activity/activity.js";
import attendanceRouter from "./attendance/attendance.js";
import organizationRouter from "./organization/organization.js";
import seasonRouter from "./season/season.js";
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
 * tags:
 *   name: Seasons
 *   description: 회기 전환 관리 API
 */
router.use("/seasons", seasonRouter);

// 설정된 라우터 모듈을 내보냅니다.
export default router;
