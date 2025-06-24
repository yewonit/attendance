import { Router } from "express";
import attendanceAggregationService from "../../services/attendance/attendance_aggregation";

const router = Router();

router.get("", async (req, res, next) => {
  const query = req.query;
	try {
		const data = await attendanceAggregationService.aggregate(query);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});
