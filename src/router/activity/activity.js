import { Router } from "express";
import activityService from "../../services/activity/activity";

const router = Router();

router.get("", async (req, res, next) => {
  res.status(200).json({
    data: activityService.getActivityTemplate(),
    error: null
  })
});

router.post("/activities", async (req, res, next) => {
  const { organizationId, activityTemplateId } = req.query;
  const data = req.body;
  try {
    await activityService.recordActivityAndAttendance(organizationId, activityTemplateId, data)
    res.status(201).json({
      data: "success",
      error: null
    })
  } catch (error) {
    next(error)
  }
})

router.get("/activities/:id", async (req, res, next) => {
  const activityId = req.path.id

  try {
    const data = await activityService.getActivityDetails(activityId)
    const response = {
      data: data,
      error: null
    }

    res.status(200).json({
      data: response,
      error: null
    })
  } catch (error) {
    next(error)
  }
})

router.put("/activities/:id", async (req, res, next) => {
  const activityId = req.path.id
  const data = req.body

  try {
    await activityService.updateActivityAndAttendance(activityId, data)
    res.status(200).json({
      data: "success",
      error: null
    })
  } catch (error) {
    next(error)
  }
})

router.delete("/activities/:id", async (req, res, next) => {
  const activityId = req.path.id

  try {
    await activityService.deleteActivityAndAttendance(activityId)
    res.status(200).json({
      data: "success",
      error: null
    })
  } catch (error) {
    next(error)
  }
})

export default router;
