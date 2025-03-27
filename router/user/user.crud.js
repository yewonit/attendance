import { Router } from "express";
import userService from "../../services/user/user.js";

const router = Router();

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;

	try {
		const data = await userService.findUser(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.post("", async (req, res, next) => {
	const { userData, organizationId, idOfCreatingUser } = req.body;

	try {
		const data = await userService.createUser(
			userData,
			organizationId,
			idOfCreatingUser
		);
		res.status(201).json(data);
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const datas = await userService.findUsers();
		res.status(200).json({ data: datas });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id; // 추후에 params에서 가져오도록 수정 필요

	try {
		const updated = await userService.updateUser(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id; // 추후에 params에서 가져오도록 수정 필요

	try {
		const deleted = await userService.deleteUser(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
