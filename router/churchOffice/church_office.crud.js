import { Router } from "express";
import churchOfficeService from "../../services/churchOffice/church_office.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newOffice = req.body;
	try {
		const data = await churchOfficeService.createChurchOffice(newOffice);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await churchOfficeService.findChurchOffices();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await churchOfficeService.findChurchOffice(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await churchOfficeService.updateChurchOffice(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await churchOfficeService.deleteChurchOffice(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
