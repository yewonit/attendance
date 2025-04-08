import { Router } from "express";
import activityInstanceCrudRouter from "./activity_instance.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activity Instances
 *   description: 활동 인스턴스 관리 API
 */

/**
 * @swagger
 * /api/activity-instances:
 *   post:
 *     summary: 새로운 활동 인스턴스 생성
 *     description: 새로운 활동 인스턴스를 생성합니다.
 *     tags: [Activity Instances]
 *     responses:
 *       201:
 *         description: 성공적으로 활동 인스턴스가 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 활동 인스턴스 조회
 *     description: 모든 활동 인스턴스 목록을 조회합니다.
 *     tags: [Activity Instances]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-instances/{id}:
 *   get:
 *     summary: 특정 활동 인스턴스 조회
 *     description: ID로 특정 활동 인스턴스를 조회합니다.
 *     tags: [Activity Instances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스를 조회했습니다.
 *       404:
 *         description: 해당 ID의 활동 인스턴스를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-instances:
 *   put:
 *     summary: 활동 인스턴스 정보 수정
 *     description: 기존 활동 인스턴스의 정보를 수정합니다.
 *     tags: [Activity Instances]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 활동 인스턴스를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 활동 인스턴스 삭제
 *     description: 특정 활동 인스턴스를 삭제합니다.
 *     tags: [Activity Instances]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스가 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 활동 인스턴스를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", activityInstanceCrudRouter);

export default router;
