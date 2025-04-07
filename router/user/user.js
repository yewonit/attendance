import { Router } from "express";
import userService from "../../services/user/user.js";
import userCrudRouter from "./user.crud.js";

const router = Router();

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

// 이름으로 회원 검색 API 추가
router.get("/search", async (req, res, next) => {
	try {
		const { name } = req.query;
		
		if (!name) {
			return res.status(400).json({ 
				success: false, 
				message: "이름을 입력해주세요." 
			});
		}
		
		const members = await userService.searchMembersByName(name);
		
		if (members.length === 0) {
			return res.status(404).json({
				success: false,
				message: "해당 이름의 교인이 없습니다."
			});
		}
		
		return res.status(200).json({
			success: true,
			data: members
		});
		
	} catch (error) {
		next(error);
	}
});

// CRUD 라우터는 마지막에 통합
router.use("/", userCrudRouter);

export default router;
