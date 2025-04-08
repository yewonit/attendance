import { Router } from "express";
import seasonCrudRouter from "./season.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Seasons
 *   description: 시즌 관리 API
 */

/**
 * @swagger
 * /api/seasons:
 *   post:
 *     summary: 새로운 시즌 생성
 *     description: 새로운 시즌을 생성합니다.
 *     tags: [Seasons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               season_name:
 *                 type: string
 *                 description: 시즌 이름
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 시즌 시작일
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 시즌 종료일
 *               description:
 *                 type: string
 *                 description: 시즌 설명
 *     responses:
 *       201:
 *         description: 성공적으로 시즌이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: 모든 시즌 조회
 *     description: 모든 시즌을 조회합니다.
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: 성공적으로 시즌 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     summary: 특정 시즌 조회
 *     description: ID로 특정 시즌을 조회합니다.
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 시즌 ID
 *     responses:
 *       200:
 *         description: 성공적으로 시즌을 조회했습니다.
 *       404:
 *         description: 시즌을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/seasons:
 *   put:
 *     summary: 시즌 정보 업데이트
 *     description: 기존 시즌의 정보를 업데이트합니다.
 *     tags: [Seasons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 시즌 ID
 *               season_name:
 *                 type: string
 *                 description: 시즌 이름
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 시즌 시작일
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 시즌 종료일
 *               description:
 *                 type: string
 *                 description: 시즌 설명
 *     responses:
 *       200:
 *         description: 성공적으로 시즌이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 시즌을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/seasons:
 *   delete:
 *     summary: 시즌 삭제
 *     description: 특정 시즌을 삭제합니다.
 *     tags: [Seasons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 시즌 ID
 *     responses:
 *       200:
 *         description: 성공적으로 시즌이 삭제되었습니다.
 *       404:
 *         description: 시즌을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", seasonCrudRouter);

export default router;
