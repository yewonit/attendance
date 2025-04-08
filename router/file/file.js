import { Router } from "express";
import fileCrudRouter from "./file.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: 파일 관리 API
 */

/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: 새로운 파일 생성
 *     description: 새로운 파일을 생성합니다.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               file_name:
 *                 type: string
 *                 description: 파일 이름
 *               file_path:
 *                 type: string
 *                 description: 파일 경로
 *               file_type:
 *                 type: string
 *                 description: 파일 타입
 *               file_size:
 *                 type: integer
 *                 description: 파일 크기
 *     responses:
 *       201:
 *         description: 성공적으로 파일이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: 모든 파일 조회
 *     description: 모든 파일을 조회합니다.
 *     tags: [Files]
 *     responses:
 *       200:
 *         description: 성공적으로 파일 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: 특정 파일 조회
 *     description: ID로 특정 파일을 조회합니다.
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 파일 ID
 *     responses:
 *       200:
 *         description: 성공적으로 파일을 조회했습니다.
 *       404:
 *         description: 파일을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/files:
 *   put:
 *     summary: 파일 정보 업데이트
 *     description: 기존 파일의 정보를 업데이트합니다.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 파일 ID
 *               file_name:
 *                 type: string
 *                 description: 파일 이름
 *               file_path:
 *                 type: string
 *                 description: 파일 경로
 *               file_type:
 *                 type: string
 *                 description: 파일 타입
 *               file_size:
 *                 type: integer
 *                 description: 파일 크기
 *     responses:
 *       200:
 *         description: 성공적으로 파일이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 파일을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/files:
 *   delete:
 *     summary: 파일 삭제
 *     description: 특정 파일을 삭제합니다.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 파일 ID
 *     responses:
 *       200:
 *         description: 성공적으로 파일이 삭제되었습니다.
 *       404:
 *         description: 파일을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", fileCrudRouter);

export default router;
