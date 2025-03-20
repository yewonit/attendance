import { Router } from "express";
import attendanceService from "../../services/attendance/attendance.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newAttendance = req.body;
	try {
		const data = await attendanceService.createAttendance(newAttendance);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await attendanceService.findAttendances();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await attendanceService.findAttendance(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await attendanceService.updateAttendance(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", async (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = await attendanceService.deleteAttendance(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
