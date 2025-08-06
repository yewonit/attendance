import { Router } from "express";
import permissionCrudRouter from "./permissions.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: 권한 관리 API
 */

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: 새로운 권한 생성
 *     description: 새로운 권한을 생성합니다.
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 권한 이름
 *               description:
 *                 type: string
 *                 description: 권한 설명
 *     responses:
 *       201:
 *         description: 성공적으로 권한이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: 모든 권한 조회
 *     description: 모든 권한을 조회합니다.
 *     tags: [Permissions]
 *     responses:
 *       200:
 *         description: 성공적으로 권한 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: 특정 권한 조회
 *     description: ID로 특정 권한을 조회합니다.
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 권한 ID
 *     responses:
 *       200:
 *         description: 성공적으로 권한을 조회했습니다.
 *       404:
 *         description: 권한을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permissions:
 *   put:
 *     summary: 권한 정보 업데이트
 *     description: 기존 권한의 정보를 업데이트합니다.
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 권한 ID
 *               name:
 *                 type: string
 *                 description: 권한 이름
 *               description:
 *                 type: string
 *                 description: 권한 설명
 *     responses:
 *       200:
 *         description: 성공적으로 권한이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 권한을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permissions:
 *   delete:
 *     summary: 권한 삭제
 *     description: 특정 권한을 삭제합니다.
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 권한 ID
 *     responses:
 *       200:
 *         description: 성공적으로 권한이 삭제되었습니다.
 *       404:
 *         description: 권한을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", permissionCrudRouter);

export default router;
