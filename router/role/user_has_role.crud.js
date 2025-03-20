import { Router } from "express";
import userHasRoleService from "../../services/role/user_has_role.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newUserRole = req.body;
	try {
		const data = await userHasRoleService.createUserHasRole(newUserRole);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await userHasRoleService.findUserHasRoles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await userHasRoleService.findUserHasRole(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await userHasRoleService.updateUserHasRole(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await userHasRoleService.deleteUserHasRole(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
