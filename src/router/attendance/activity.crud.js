import { Router } from "express";
import activityService from "../../services/attendance/activity.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newActivity = req.body;
	try {
		const data = await activityService.createActivity(newActivity);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

export default router;
