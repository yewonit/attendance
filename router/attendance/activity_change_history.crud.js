import { Router } from "express";
import activityChangeHistoryService from "../../services/attendance/activity_change_history.js";

const router = Router();

router.post("", (req, res, next) => {
	const newHistory = req.body;
	try {
		const data =
			activityChangeHistoryService.createActivityChangeHistory(newHistory);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityChangeHistoryService.findActivityChangeHistories();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityChangeHistoryService.findActivityChangeHistory(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = activityChangeHistoryService.updateActivityChangeHistory(
			id,
			newModel
		);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted =
			activityChangeHistoryService.deleteActivityChangeHistory(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
