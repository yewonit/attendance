import { Router } from "express";
import fileService from "../../services/file/file.js";

const router = Router();

router.post("", (req, res, next) => {
	const newFile = req.body;
	try {
		const data = fileService.createFile(newFile);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = fileService.findFiles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = fileService.findFile(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = fileService.updateFile(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = fileService.deleteFile(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
