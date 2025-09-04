import { Router } from "express";


const router = Router();

router.get("/weekly", async (req, res, next) => {
  const { gook, group } = req.query;
  try {
    const data = await attendanceService.getWeeklyAttendanceAggregation(gook, group);
    res.status(200).json({
      data: data,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/graph", async (req, res, next) => {
  const { gook, group } = req.query;
});

router.get("/continuous", async (req, res, next) => {
  const { gook, group } = req.query;
});

router.get("/trend", async (req, res, next) => {
  const { gook, group } = req.query;
});

export default router;
