import { Router } from "express";
import activityCategoryService from "../../services/attendance/activity_category.js";

const router = Router();

router.post("", (req, res, next) => {
	const newCategory = req.body;
	try {
		const data = activityCategoryService.createActivityCategory(newCategory);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = activityCategoryService.findActivityCategories();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = activityCategoryService.findActivityCategory(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = activityCategoryService.updateActivityCategory(
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
		const deleted = activityCategoryService.deleteActivityCategory(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
