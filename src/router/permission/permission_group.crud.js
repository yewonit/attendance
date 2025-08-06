import { Router } from "express";
import permissionGroupService from "../services/permission/permission_group.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newPermissionGroup = req.body;
	try {
		const data = await permissionGroupService.createPermissionGroup(
			newPermissionGroup
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await permissionGroupService.findPermissionGroups();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await permissionGroupService.findPermissionGroup(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await permissionGroupService.updatePermissionGroup(
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
		const deleted = await permissionGroupService.deletePermissionGroup(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
