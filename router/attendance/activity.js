import { Router } from "express";
import activityCrudRouter from "./activity.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: 활동 관리 API
 */

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: 새로운 활동 생성
 *     description: 새로운 활동을 생성합니다.
 *     tags: [Activities]
 *     responses:
 *       201:
 *         description: 성공적으로 활동이 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 활동 조회
 *     description: 모든 활동 목록을 조회합니다.
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: 특정 활동 조회
 *     description: ID로 특정 활동을 조회합니다.
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 활동을 조회했습니다.
 *       404:
 *         description: 해당 ID의 활동을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activities:
 *   put:
 *     summary: 활동 정보 수정
 *     description: 기존 활동의 정보를 수정합니다.
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 활동을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 활동 삭제
 *     description: 특정 활동을 삭제합니다.
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: 성공적으로 활동이 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 활동을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", activityCrudRouter);

export default router;
