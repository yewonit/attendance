import { Router } from "express";
import roleService from "../../services/role/role.js";

const router = Router();

router.post("", (req, res, next) => {
	const newRole = req.body;
	try {
		const data = roleService.createRole(newRole);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = roleService.findRoles();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = roleService.findRole(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = roleService.updateRole(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = roleService.deleteRole(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
