import { Router } from "express";
import permissionService from "../services/permission/permissions.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newPermission = req.body;
	try {
		const data = await permissionService.createPermission(newPermission);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await permissionService.findPermissions();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await permissionService.findPermission(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await permissionService.updatePermission(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await permissionService.deletePermission(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
