import { Router } from "express";
import attendanceAggregationService from "../../services/attendance/attendance_aggregation.js";

const router = Router();

router.get("/graph", async (req, res, next) => {
	const query = req.query;
	try {
		const data = await attendanceAggregationService.aggregateGraph(query);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

export default router
