import { Router } from "express";
import attendanceService from "../../services/attendance/attendance.js";

const router = Router();

router.get("/weekly", async (req, res, next) => {
	const { gook, group, soon } = req.query;
	try {
		const data = await attendanceService.getWeeklyAttendanceAggregation(
			gook,
			group
		);
		res.status(200).json({
			data: data,
			error: null,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/graph", async (req, res, next) => {
	const { gook, group, soon } = req.query;
	try {
		const data = await attendanceService.getWeeklyAttendanceGraph(gook, group);
		res.status(200).json({
			data: data,
			error: null,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/continuous", async (req, res, next) => {
	const { gook, group, soon } = req.query;
	try {
		const data = await attendanceService.getContinuousMembers(
			gook,
			group,
			soon
		);
		res.status(200).json({
			data: data,
			error: null,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/trend", async (req, res, next) => {
	try {
		const data = await attendanceService.getYoungAdultAttendanceTrend();
		res.status(200).json({
			data: data,
			error: null,
		});
	} catch (error) {
		next(error);
	}
});

export default router;
