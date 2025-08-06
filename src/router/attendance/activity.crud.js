import { Router } from "express";
import activityService from "../services/attendance/activity.js";

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

router.get("", async (req, res, next) => {
	try {
		const data = await activityService.findActivities();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await activityService.findActivity(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await activityService.updateActivity(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await activityService.deleteActivity(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
