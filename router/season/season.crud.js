import { Router } from "express";
import seasonService from "../../services/season/season.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newSeason = req.body;
	try {
		const data = await seasonService.createSeason(newSeason);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await seasonService.findSeasons();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await seasonService.findSeason(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await seasonService.updateSeason(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await seasonService.deleteSeason(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
