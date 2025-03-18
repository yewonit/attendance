import { Router } from "express";
import userHasRoleService from "../../services/role/user_has_role.js";

const router = Router();

router.post("", (req, res, next) => {
	const newUserRole = req.body;
	try {
		const data = userHasRoleService.createUserHasRole(newUserRole);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = userHasRoleService.findUserHasRoles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = userHasRoleService.findUserHasRole(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = userHasRoleService.updateUserHasRole(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = userHasRoleService.deleteUserHasRole(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
