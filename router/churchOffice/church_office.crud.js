import { Router } from "express";
import churchOfficeService from "../../services/churchOffice/church_office.js";

const router = Router();

router.post("", (req, res, next) => {
	const newOffice = req.body;
	try {
		const data = churchOfficeService.createChurchOffice(newOffice);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = churchOfficeService.findChurchOffices();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = churchOfficeService.findChurchOffice(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = churchOfficeService.updateChurchOffice(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = churchOfficeService.deleteChurchOffice(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
