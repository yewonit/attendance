import { Router } from "express";
import activityInstanceHasFileService from "../../services/file/activity_instance_has_file.js";

const router = Router();

router.post("", (req, res, next) => {
	const newInstanceFile = req.body;
	try {
		const data =
			activityInstanceHasFileService.createActivityInstanceHasFile(
				newInstanceFile
			);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityInstanceHasFileService.findActivityInstanceHasFiles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityInstanceHasFileService.findActivityInstanceHasFile(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated =
			activityInstanceHasFileService.updateActivityInstanceHasFile(
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
			activityInstanceHasFileService.deleteActivityInstanceHasFile(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
