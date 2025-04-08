import { Router } from "express";
import activityCategoryCrudRouter from "./activity_category.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activity Categories
 *   description: 활동 카테고리 관리 API
 */

/**
 * @swagger
 * /api/activity-categories:
 *   post:
 *     summary: 새로운 활동 카테고리 생성
 *     description: 새로운 활동 카테고리를 생성합니다.
 *     tags: [Activity Categories]
 *     responses:
 *       201:
 *         description: 성공적으로 활동 카테고리가 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 활동 카테고리 조회
 *     description: 모든 활동 카테고리 목록을 조회합니다.
 *     tags: [Activity Categories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 카테고리 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-categories/{id}:
 *   get:
 *     summary: 특정 활동 카테고리 조회
 *     description: ID로 특정 활동 카테고리를 조회합니다.
 *     tags: [Activity Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 활동 카테고리를 조회했습니다.
 *       404:
 *         description: 해당 ID의 활동 카테고리를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-categories:
 *   put:
 *     summary: 활동 카테고리 정보 수정
 *     description: 기존 활동 카테고리의 정보를 수정합니다.
 *     tags: [Activity Categories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 카테고리 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 활동 카테고리를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 활동 카테고리 삭제
 *     description: 특정 활동 카테고리를 삭제합니다.
 *     tags: [Activity Categories]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 카테고리가 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 활동 카테고리를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", activityCategoryCrudRouter);

export default router;
