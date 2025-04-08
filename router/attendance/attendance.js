import { Router } from "express";
import attendanceCrudRouter from "./attendance.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendances
 *   description: 출석 관리 API
 */

/**
 * @swagger
 * /api/attendances:
 *   post:
 *     summary: 새로운 출석 기록 생성
 *     description: 새로운 출석 기록을 생성합니다.
 *     tags: [Attendances]
 *     responses:
 *       201:
 *         description: 성공적으로 출석 기록이 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 출석 기록 조회
 *     description: 모든 출석 기록 목록을 조회합니다.
 *     tags: [Attendances]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 기록 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/attendances/{id}:
 *   get:
 *     summary: 특정 출석 기록 조회
 *     description: ID로 특정 출석 기록을 조회합니다.
 *     tags: [Attendances]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 출석 기록을 조회했습니다.
 *       404:
 *         description: 해당 ID의 출석 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/attendances:
 *   put:
 *     summary: 출석 기록 정보 수정
 *     description: 기존 출석 기록의 정보를 수정합니다.
 *     tags: [Attendances]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 기록 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 출석 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 출석 기록 삭제
 *     description: 특정 출석 기록을 삭제합니다.
 *     tags: [Attendances]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 기록이 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 출석 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", attendanceCrudRouter);

export default router;
