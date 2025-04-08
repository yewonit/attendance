import { Router } from "express";
import activityHasFileCrudRouter from "./activity_has_file.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Activity Files
 *   description: 활동 파일 관리 API
 */

/**
 * @swagger
 * /api/activity-has-files:
 *   post:
 *     summary: 새로운 활동 파일 연결 생성
 *     description: 새로운 활동과 파일의 연결을 생성합니다.
 *     tags: [Activity Files]
 *     responses:
 *       201:
 *         description: 성공적으로 활동 파일 연결이 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 활동 파일 연결 조회
 *     description: 모든 활동과 파일의 연결 목록을 조회합니다.
 *     tags: [Activity Files]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 파일 연결 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-has-files/{id}:
 *   get:
 *     summary: 특정 활동 파일 연결 조회
 *     description: ID로 특정 활동과 파일의 연결을 조회합니다.
 *     tags: [Activity Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 활동 파일 연결을 조회했습니다.
 *       404:
 *         description: 해당 ID의 활동 파일 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/activity-has-files:
 *   put:
 *     summary: 활동 파일 연결 정보 수정
 *     description: 기존 활동과 파일의 연결 정보를 수정합니다.
 *     tags: [Activity Files]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 파일 연결 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 활동 파일 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 활동 파일 연결 삭제
 *     description: 특정 활동과 파일의 연결을 삭제합니다.
 *     tags: [Activity Files]
 *     responses:
 *       200:
 *         description: 성공적으로 활동 파일 연결이 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 활동 파일 연결을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", activityHasFileCrudRouter);

export default router;
