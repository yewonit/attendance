import { Router } from "express";
import churchOfficeCrudRouter from "./church_office.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Church Offices
 *   description: 교회 직분 관리 API
 */

/**
 * @swagger
 * /api/church-offices:
 *   post:
 *     summary: 새로운 교회 직분 생성
 *     description: 새로운 교회 직분을 생성합니다.
 *     tags: [Church Offices]
 *     responses:
 *       201:
 *         description: 성공적으로 교회 직분이 생성되었습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   get:
 *     summary: 모든 교회 직분 조회
 *     description: 모든 교회 직분 목록을 조회합니다.
 *     tags: [Church Offices]
 *     responses:
 *       200:
 *         description: 성공적으로 교회 직분 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/church-offices/{id}:
 *   get:
 *     summary: 특정 교회 직분 조회
 *     description: ID로 특정 교회 직분을 조회합니다.
 *     tags: [Church Offices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 성공적으로 교회 직분을 조회했습니다.
 *       404:
 *         description: 해당 ID의 교회 직분을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/church-offices:
 *   put:
 *     summary: 교회 직분 정보 수정
 *     description: 기존 교회 직분의 정보를 수정합니다.
 *     tags: [Church Offices]
 *     responses:
 *       200:
 *         description: 성공적으로 교회 직분 정보가 수정되었습니다.
 *       404:
 *         description: 해당 ID의 교회 직분을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 *   delete:
 *     summary: 교회 직분 삭제
 *     description: 특정 교회 직분을 삭제합니다.
 *     tags: [Church Offices]
 *     responses:
 *       200:
 *         description: 성공적으로 교회 직분이 삭제되었습니다.
 *       404:
 *         description: 해당 ID의 교회 직분을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.use("/", churchOfficeCrudRouter);

export default router;
