import { Router } from "express";
import roleCrudRouter from "./role.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: 역할 관리 API
 */

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: 새로운 역할 생성
 *     description: 새로운 역할을 생성합니다.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 description: 역할 이름
 *               organization_id:
 *                 type: integer
 *                 description: 조직 ID
 *               description:
 *                 type: string
 *                 description: 역할 설명
 *     responses:
 *       201:
 *         description: 성공적으로 역할이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: 모든 역할 조회
 *     description: 모든 역할을 조회합니다.
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: 성공적으로 역할 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: 특정 역할 조회
 *     description: ID로 특정 역할을 조회합니다.
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 역할 ID
 *     responses:
 *       200:
 *         description: 성공적으로 역할을 조회했습니다.
 *       404:
 *         description: 역할을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/roles:
 *   put:
 *     summary: 역할 정보 업데이트
 *     description: 기존 역할의 정보를 업데이트합니다.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 역할 ID
 *               role_name:
 *                 type: string
 *                 description: 역할 이름
 *               organization_id:
 *                 type: integer
 *                 description: 조직 ID
 *               description:
 *                 type: string
 *                 description: 역할 설명
 *     responses:
 *       200:
 *         description: 성공적으로 역할이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 역할을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/roles:
 *   delete:
 *     summary: 역할 삭제
 *     description: 특정 역할을 삭제합니다.
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 역할 ID
 *     responses:
 *       200:
 *         description: 성공적으로 역할이 삭제되었습니다.
 *       404:
 *         description: 역할을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", roleCrudRouter);

export default router;
