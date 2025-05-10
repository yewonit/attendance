import { Router } from "express";
import permissionGroupCrudRouter from "./permission_group.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Permission Groups
 *   description: 권한 그룹 관리 API
 */

/**
 * @swagger
 * /api/permission-groups:
 *   post:
 *     summary: 새로운 권한 그룹 생성
 *     description: 새로운 권한 그룹을 생성합니다.
 *     tags: [Permission Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 권한 그룹 이름
 *               description:
 *                 type: string
 *                 description: 권한 그룹 설명
 *     responses:
 *       201:
 *         description: 성공적으로 권한 그룹이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permission-groups:
 *   get:
 *     summary: 모든 권한 그룹 조회
 *     description: 모든 권한 그룹을 조회합니다.
 *     tags: [Permission Groups]
 *     responses:
 *       200:
 *         description: 성공적으로 권한 그룹 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permission-groups/{id}:
 *   get:
 *     summary: 특정 권한 그룹 조회
 *     description: ID로 특정 권한 그룹을 조회합니다.
 *     tags: [Permission Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 권한 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 권한 그룹을 조회했습니다.
 *       404:
 *         description: 권한 그룹을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permission-groups:
 *   put:
 *     summary: 권한 그룹 정보 업데이트
 *     description: 기존 권한 그룹의 정보를 업데이트합니다.
 *     tags: [Permission Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 권한 그룹 ID
 *               name:
 *                 type: string
 *                 description: 권한 그룹 이름
 *               description:
 *                 type: string
 *                 description: 권한 그룹 설명
 *     responses:
 *       200:
 *         description: 성공적으로 권한 그룹이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 권한 그룹을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/permission-groups:
 *   delete:
 *     summary: 권한 그룹 삭제
 *     description: 특정 권한 그룹을 삭제합니다.
 *     tags: [Permission Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 권한 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 권한 그룹이 삭제되었습니다.
 *       404:
 *         description: 권한 그룹을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", permissionGroupCrudRouter);

export default router;
