import { Router } from "express";
import userHasChurchOfficeService from "../../services/churchOffice/user_has_church_office.js";

const router = Router();

router.post("", (req, res, next) => {
	const newUserOffice = req.body;
	try {
		const data =
			userHasChurchOfficeService.createUserHasChurchOffice(newUserOffice);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = userHasChurchOfficeService.findUserHasChurchOffices();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = userHasChurchOfficeService.findUserHasChurchOffice(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = userHasChurchOfficeService.updateUserHasChurchOffice(
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
		const deleted = userHasChurchOfficeService.deleteUserHasChurchOffice(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
