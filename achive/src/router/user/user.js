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

router.patch("/:id/change-organization", async (req, res, next) => {
	const id = req.params.id;
	const { organizationId, roleName } = req.body;

	try {
		await userService.changeOrganization(id, organizationId, roleName);
		res.status(200).json({ message: "success" });
	} catch (error) {
		next(error);
	}
});

router.patch("/bulk-change-organization", async (req, res, next) => {
	const { data } = req.body;

	try {
		for (let item of data) {
			await userService.changeOrganization(item.id, item.organizationId, item.roleName);
		}
		res.status(200).json({ message: "success" });
	} catch (error) {
		next(error);
	}
});

// CRUD 라우터는 마지막에 통합
router.use("/", userCrudRouter);

export default router;
