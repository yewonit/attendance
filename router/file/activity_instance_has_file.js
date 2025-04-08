import { Router } from "express";
import activityInstanceHasFileCrudRouter from "./activity_instance_has_file.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activity Instance Files
 *   description: 활동 인스턴스 파일 관리 API
 */

/**
 * @swagger
 * /api/activity-instance-has-files:
 *   post:
 *     summary: 새로운 활동 인스턴스 파일 연결 생성
 *     description: 활동 인스턴스와 파일 간의 새로운 연결을 생성합니다.
 *     tags: [Activity Instance Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activity_instance_id:
 *                 type: integer
 *                 description: 활동 인스턴스 ID
 *               file_id:
 *                 type: integer
 *                 description: 파일 ID
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
 * /api/activity-instance-has-files:
 *   get:
 *     summary: 모든 활동 인스턴스 파일 연결 조회
 *     description: 모든 활동 인스턴스와 파일 간의 연결을 조회합니다.
 *     tags: [Activity Instance Files]
 *     responses:
 *       200:
 *         description: 성공적으로 연결 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-instance-has-files/{id}:
 *   get:
 *     summary: 특정 활동 인스턴스 파일 연결 조회
 *     description: ID로 특정 활동 인스턴스와 파일 간의 연결을 조회합니다.
 *     tags: [Activity Instance Files]
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
 * /api/activity-instance-has-files:
 *   put:
 *     summary: 활동 인스턴스 파일 연결 업데이트
 *     description: 기존 활동 인스턴스와 파일 간의 연결을 업데이트합니다.
 *     tags: [Activity Instance Files]
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
 *               activity_instance_id:
 *                 type: integer
 *                 description: 활동 인스턴스 ID
 *               file_id:
 *                 type: integer
 *                 description: 파일 ID
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
 * /api/activity-instance-has-files:
 *   delete:
 *     summary: 활동 인스턴스 파일 연결 삭제
 *     description: 특정 활동 인스턴스와 파일 간의 연결을 삭제합니다.
 *     tags: [Activity Instance Files]
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

router.use("/", activityInstanceHasFileCrudRouter);

export default router;
