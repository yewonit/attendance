import { Router } from "express";
import activityHasFileService from "../../services/file/activity_has_file.js";

const router = Router();

router.post("", (req, res, next) => {
	const newActivityFile = req.body;
	try {
		const data = activityHasFileService.createActivityHasFile(newActivityFile);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityHasFileService.findActivityHasFiles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityHasFileService.findActivityHasFile(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = activityHasFileService.updateActivityHasFile(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = activityHasFileService.deleteActivityHasFile(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
