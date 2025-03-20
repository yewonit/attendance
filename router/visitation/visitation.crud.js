import { Router } from "express";
import visitationService from "../../services/visitation/visitation.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newVisitation = req.body;
	try {
		const data = await visitationService.createVisitation(newVisitation);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await visitationService.findVisitations();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await visitationService.findVisitation(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await visitationService.updateVisitation(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await visitationService.deleteVisitation(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
