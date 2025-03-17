import { Router } from "express";
import organizationService from "../../services/organization/organization.js";

const router = Router();

router.post("", (req, res, next) => {
	const newOrganization = req.body;
	try {
		const data = organizationService.createOrganization(newOrganization);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = organizationService.findOrganizations();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = organizationService.findOrganization(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = organizationService.updateOrganization(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = organizationService.deleteOrganization(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
