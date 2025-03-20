import { Router } from "express";
import attendanceStatusService from "../../services/attendance/attendance_status.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newStatus = req.body;
	try {
		const data = await attendanceStatusService.createAttendanceStatus(
			newStatus
		);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("", async (req, res, next) => {
	try {
		const data = await attendanceStatusService.findAttendanceStatuses();
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await attendanceStatusService.findAttendanceStatus(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("", async (req, res, next) => {
	const newModel = req.body;
	const id = newModel.id;
	try {
		const updated = await attendanceStatusService.updateAttendanceStatus(
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
		const deleted = await attendanceStatusService.deleteAttendanceStatus(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
