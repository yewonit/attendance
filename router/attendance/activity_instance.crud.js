import { Router } from "express";
import activityInstanceService from "../../services/attendance/activity_instance.js";

const router = Router();

router.post("", (req, res, next) => {
	const newInstance = req.body;
	try {
		const data = activityInstanceService.createActivityInstance(newInstance);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityInstanceService.findActivityInstances();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityInstanceService.findActivityInstance(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = activityInstanceService.updateActivityInstance(
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
		const deleted = activityInstanceService.deleteActivityInstance(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
