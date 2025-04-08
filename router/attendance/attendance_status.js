import { Router } from "express";
import attendanceStatusCrudRouter from "./attendance_status.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance Statuses
 *   description: 출석 상태 관리 API
 */

/**
 * @swagger
 * /api/attendance-statuses:
 *   post:
 *     summary: 새로운 출석 상태 생성
 *     description: 새로운 출석 상태를 생성합니다.
 *     tags: [Attendance Statuses]
 *     responses:
 *       201:
 *         description: 성공적으로 출석 상태가 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 출석 상태 조회
 *     description: 모든 출석 상태 목록을 조회합니다.
 *     tags: [Attendance Statuses]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 상태 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/attendance-statuses/{id}:
 *   get:
 *     summary: 특정 출석 상태 조회
 *     description: ID로 특정 출석 상태를 조회합니다.
 *     tags: [Attendance Statuses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 출석 상태를 조회했습니다.
 *       404:
 *         description: 해당 ID의 출석 상태를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/attendance-statuses:
 *   put:
 *     summary: 출석 상태 정보 수정
 *     description: 기존 출석 상태의 정보를 수정합니다.
 *     tags: [Attendance Statuses]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 상태 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 출석 상태를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 출석 상태 삭제
 *     description: 특정 출석 상태를 삭제합니다.
 *     tags: [Attendance Statuses]
 *     responses:
 *       200:
 *         description: 성공적으로 출석 상태가 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 출석 상태를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", attendanceStatusCrudRouter);

export default router;
