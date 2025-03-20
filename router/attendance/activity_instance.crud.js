import { Router } from "express";
import activityInstanceService from "../../services/attendance/activity_instance.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newInstance = req.body;
	try {
		const data = await activityInstanceService.createActivityInstance(
			newInstance
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await activityInstanceService.findActivityInstances();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await activityInstanceService.findActivityInstance(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await activityInstanceService.updateActivityInstance(
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
		const deleted = await activityInstanceService.deleteActivityInstance(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
