import { Router } from "express";
import visitationCrudRouter from "./visitation.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Visitations
 *   description: 방문 관리 API
 */

/**
 * @swagger
 * /api/visitations:
 *   post:
 *     summary: 새로운 방문 기록 생성
 *     description: 새로운 방문 기록을 생성합니다.
 *     tags: [Visitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               visitor_id:
 *                 type: integer
 *                 description: 방문자 ID
 *               visited_user_id:
 *                 type: integer
 *                 description: 방문 대상자 ID
 *               visitation_date:
 *                 type: string
 *                 format: date
 *                 description: 방문 날짜
 *               visitation_type:
 *                 type: string
 *                 description: 방문 유형
 *               visitation_result:
 *                 type: string
 *                 description: 방문 결과
 *               notes:
 *                 type: string
 *                 description: 방문 메모
 *     responses:
 *       201:
 *         description: 성공적으로 방문 기록이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/visitations:
 *   get:
 *     summary: 모든 방문 기록 조회
 *     description: 모든 방문 기록을 조회합니다.
 *     tags: [Visitations]
 *     responses:
 *       200:
 *         description: 성공적으로 방문 기록 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/visitations/{id}:
 *   get:
 *     summary: 특정 방문 기록 조회
 *     description: ID로 특정 방문 기록을 조회합니다.
 *     tags: [Visitations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 방문 기록 ID
 *     responses:
 *       200:
 *         description: 성공적으로 방문 기록을 조회했습니다.
 *       404:
 *         description: 방문 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/visitations:
 *   put:
 *     summary: 방문 기록 수정
 *     description: 기존 방문 기록을 수정합니다.
 *     tags: [Visitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 방문 기록 ID
 *               visitor_id:
 *                 type: integer
 *                 description: 방문자 ID
 *               visited_user_id:
 *                 type: integer
 *                 description: 방문 대상자 ID
 *               visitation_date:
 *                 type: string
 *                 format: date
 *                 description: 방문 날짜
 *               visitation_type:
 *                 type: string
 *                 description: 방문 유형
 *               visitation_result:
 *                 type: string
 *                 description: 방문 결과
 *               notes:
 *                 type: string
 *                 description: 방문 메모
 *     responses:
 *       200:
 *         description: 성공적으로 방문 기록이 수정되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 방문 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/visitations:
 *   delete:
 *     summary: 방문 기록 삭제
 *     description: 특정 방문 기록을 삭제합니다.
 *     tags: [Visitations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 삭제할 방문 기록 ID
 *     responses:
 *       200:
 *         description: 성공적으로 방문 기록이 삭제되었습니다.
 *       404:
 *         description: 방문 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", visitationCrudRouter);

export default router;
