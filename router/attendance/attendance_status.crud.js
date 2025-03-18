import { Router } from "express";
import attendanceStatusService from "../../services/attendance/attendance_status.js";

const router = Router();

router.post("", (req, res, next) => {
	const newStatus = req.body;
	try {
		const data = attendanceStatusService.createAttendanceStatus(newStatus);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", (req, res, next) => {
	try {
		const data = attendanceStatusService.findAttendanceStatuses();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", (req, res, next) => {
	const id = req.params.id;
	try {
		const data = attendanceStatusService.findAttendanceStatus(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = attendanceStatusService.updateAttendanceStatus(
			id,
			newModel
		);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("", (req, res, next) => {
	const id = req.body.id;
	try {
		const deleted = attendanceStatusService.deleteAttendanceStatus(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
