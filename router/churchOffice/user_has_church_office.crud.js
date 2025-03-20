import { Router } from "express";
import userHasChurchOfficeService from "../../services/churchOffice/user_has_church_office.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newUserOffice = req.body;
	try {
		const data = await userHasChurchOfficeService.createUserHasChurchOffice(
			newUserOffice
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await userHasChurchOfficeService.findUserHasChurchOffices();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await userHasChurchOfficeService.findUserHasChurchOffice(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await userHasChurchOfficeService.updateUserHasChurchOffice(
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
		const deleted = await userHasChurchOfficeService.deleteUserHasChurchOffice(
			id
		);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
