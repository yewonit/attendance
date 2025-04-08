import { Router } from "express";
import userHasRoleCrudRouter from "./user_has_role.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User Roles
 *   description: 사용자 역할 관리 API
 */

/**
 * @swagger
 * /api/user-has-roles:
 *   post:
 *     summary: 새로운 사용자 역할 연결 생성
 *     description: 사용자와 역할 간의 새로운 연결을 생성합니다.
 *     tags: [User Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *               role_id:
 *                 type: integer
 *                 description: 역할 ID
 *               organization_id:
 *                 type: integer
 *                 description: 조직 ID
 *               organization_code:
 *                 type: string
 *                 description: 조직 코드
 *     responses:
 *       201:
 *         description: 성공적으로 연결이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/user-has-roles:
 *   get:
 *     summary: 모든 사용자 역할 연결 조회
 *     description: 모든 사용자와 역할 간의 연결을 조회합니다.
 *     tags: [User Roles]
 *     responses:
 *       200:
 *         description: 성공적으로 연결 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/user-has-roles/{id}:
 *   get:
 *     summary: 특정 사용자 역할 연결 조회
 *     description: ID로 특정 사용자와 역할 간의 연결을 조회합니다.
 *     tags: [User Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 연결 ID
 *     responses:
 *       200:
 *         description: 성공적으로 연결을 조회했습니다.
 *       404:
 *         description: 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/user-has-roles:
 *   put:
 *     summary: 사용자 역할 연결 업데이트
 *     description: 기존 사용자와 역할 간의 연결을 업데이트합니다.
 *     tags: [User Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 연결 ID
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *               role_id:
 *                 type: integer
 *                 description: 역할 ID
 *               organization_id:
 *                 type: integer
 *                 description: 조직 ID
 *               organization_code:
 *                 type: string
 *                 description: 조직 코드
 *     responses:
 *       200:
 *         description: 성공적으로 연결이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/user-has-roles:
 *   delete:
 *     summary: 사용자 역할 연결 삭제
 *     description: 특정 사용자와 역할 간의 연결을 삭제합니다.
 *     tags: [User Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 연결 ID
 *     responses:
 *       200:
 *         description: 성공적으로 연결이 삭제되었습니다.
 *       404:
 *         description: 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", userHasRoleCrudRouter);

export default router;
