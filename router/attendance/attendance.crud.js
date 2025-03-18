import { Router } from "express";
import attendanceService from "../../services/attendance/attendance.js";

const router = Router();

router.post("", (req, res, next) => {
	const newAttendance = req.body;
	try {
		const data = attendanceService.createAttendance(newAttendance);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = attendanceService.findAttendances();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = attendanceService.findAttendance(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = attendanceService.updateAttendance(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = attendanceService.deleteAttendance(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
