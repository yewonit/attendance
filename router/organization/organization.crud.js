import { Router } from "express";
import organizationService from "../../services/organization/organization.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newOrganization = req.body;
	try {
		const data = await organizationService.createOrganization(newOrganization);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await organizationService.findOrganizations();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await organizationService.findOrganization(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await organizationService.updateOrganization(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await organizationService.deleteOrganization(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
