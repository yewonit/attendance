import { Router } from "express";
import activityService from "../../services/attendance/activity.js";

const router = Router();

router.post("", (req, res, next) => {
	const newActivity = req.body;
	try {
		const data = activityService.createActivity(newActivity);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityService.findActivities();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityService.findActivity(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = activityService.updateActivity(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = activityService.deleteActivity(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
