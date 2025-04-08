import { Router } from "express";
import activityChangeHistoryCrudRouter from "./activity_change_history.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activity Change Histories
 *   description: 활동 변경 이력 관리 API
 */

/**
 * @swagger
 * /api/activity-change-histories:
 *   post:
 *     summary: 새로운 활동 변경 이력 생성
 *     description: 새로운 활동 변경 이력을 생성합니다.
 *     tags: [Activity Change Histories]
 *     responses:
 *       201:
 *         description: 성공적으로 활동 변경 이력이 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 활동 변경 이력 조회
 *     description: 모든 활동 변경 이력 목록을 조회합니다.
 *     tags: [Activity Change Histories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 변경 이력 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-change-histories/{id}:
 *   get:
 *     summary: 특정 활동 변경 이력 조회
 *     description: ID로 특정 활동 변경 이력을 조회합니다.
 *     tags: [Activity Change Histories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 활동 변경 이력을 조회했습니다.
 *       404:
 *         description: 해당 ID의 활동 변경 이력을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-change-histories:
 *   put:
 *     summary: 활동 변경 이력 정보 수정
 *     description: 기존 활동 변경 이력의 정보를 수정합니다.
 *     tags: [Activity Change Histories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 변경 이력 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 활동 변경 이력을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 활동 변경 이력 삭제
 *     description: 특정 활동 변경 이력을 삭제합니다.
 *     tags: [Activity Change Histories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 변경 이력이 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 활동 변경 이력을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", activityChangeHistoryCrudRouter);

export default router;
