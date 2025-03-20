import { Router } from "express";
import activityHasFileService from "../../services/file/activity_has_file.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newActivityFile = req.body;
	try {
		const data = await activityHasFileService.createActivityHasFile(
			newActivityFile
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await activityHasFileService.findActivityHasFiles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await activityHasFileService.findActivityHasFile(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await activityHasFileService.updateActivityHasFile(
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
		const deleted = await activityHasFileService.deleteActivityHasFile(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
