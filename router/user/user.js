import { Router } from "express";
import userService from "../../services/user/user.js";
import userCrudRouter from "./user.crud.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 관리 API
 */

/**
 * @swagger
 * /api/users/name:
 *   get:
 *     summary: 이름으로 사용자 존재 여부 확인
 *     description: 특정 이름을 가진 사용자가 존재하는지 확인합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 확인할 사용자 이름
 *     responses:
 *       200:
 *         description: 사용자가 존재합니다.
 *       404:
 *         description: 사용자가 존재하지 않습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/users/phone-number:
 *   post:
 *     summary: 전화번호로 사용자 확인
 *     description: 이름과 전화번호로 사용자를 확인합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phoneNumber:
 *                 type: string
 *                 description: 사용자 전화번호
 *     responses:
 *       200:
 *         description: 성공적으로 사용자를 확인했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 isMatched:
 *                   type: boolean
 *                   description: 전화번호가 일치하는지 여부
 *                 userData:
 *                   type: object
 *                   description: 사용자 정보
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

// 구체적인 경로를 먼저 정의
router.get("/name", async (req, res, next) => {
	const name = req.query.name;

	try {
		const isExists = await userService.findUserByName(name);
		if (isExists) {
			res.status(200).json({ message: "이름이 있습니다." });
		} else {
			res.status(404).json({ message: "이름이 없습니다." });
		}
	} catch (error) {
		next(error);
	}
});

router.post("/phone-number", async (req, res, next) => {
	const { name, phoneNumber } = req.body;

	try {
		const userData = await userService.checkUserPhoneNumber(name, phoneNumber);
		res.status(200).json({
			isMatched: true,
			userData: userData,
		});
	} catch (error) {
		next(error);
	}
});

// CRUD 라우터는 마지막에 통합
router.use("/", userCrudRouter);

export default router;
