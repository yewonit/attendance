import { Router } from "express";
import authMiddleware from "../../../middleware/auth.js";
import userService from "../../services/user/user.js";
import userCrudRouter from "./user.crud.js";

const router = Router();

router.get("/new-members", async (req, res, next) => {
	try {
		const newMembers = await userService.getAllNewMembers();

		res.status(200).json({
			data: newMembers,
		});
	} catch (error) {
		console.error("새가족 조회 실패:", error);
		next(error);
	}
});

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

// 이름으로 회원 검색 API 추가
router.get("/search", async (req, res, next) => {
	try {
		const { name } = req.query;

		if (!name) {
			return res.status(400).json({
				success: false,
				message: "이름을 입력해주세요.",
			});
		}

		const members = await userService.searchMembersByName(name);

		if (members.length === 0) {
			return res.status(404).json({
				success: false,
				message: "해당 이름의 교인이 없습니다.",
			});
		}

		return res.status(200).json({
			success: true,
			data: members,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/accessible", authMiddleware, async (req, res, next) => {
	try {
		const { email, name } = req.auth;

		const organizations = await userService.getAccessibleOrganizations(
			email,
			name
		);

		return res.status(200).json(organizations);
	} catch (error) {
		next(error);
	}
});

// CRUD 라우터는 마지막에 통합
router.use("/", userCrudRouter);

export default router;
