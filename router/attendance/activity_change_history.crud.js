import { Router } from "express";
import activityChangeHistoryService from "../../services/attendance/activity_change_history.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newHistory = req.body;
	try {
		const data = await activityChangeHistoryService.createActivityChangeHistory(
			newHistory
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data =
			await activityChangeHistoryService.findActivityChangeHistories();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await activityChangeHistoryService.findActivityChangeHistory(
			id
		);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated =
			await activityChangeHistoryService.updateActivityChangeHistory(
				id,
				newModel
			);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted =
			await activityChangeHistoryService.deleteActivityChangeHistory(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
