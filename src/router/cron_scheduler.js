import { Router } from "express";
import userService from "../services/user/user.js";

const router = Router();

router.put("/users/new-members", async (req, res, next) => {
	try {
		await userService.setFalseIsNewMember();
		res.status(200).json({
			message: "success",
		});
	} catch (error) {
		next(error);
	}
});

router.put("/users/long-term-absentees", async (req, res, next) => {
	try {
		await userService.setIsLongTermAbsentee();
		res.status(200).json({
			message: "success",
		});
	} catch (error) {
		next(error);
	}
});

export default router;
