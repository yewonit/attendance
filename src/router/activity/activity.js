import { Router } from "express";
import activityService from "../../services/activity/activity";

const router = Router();

// TODO: organization의활동 관련 라우터 여기로 수정 필요
router.get("", async (req, res, next) => {
  res.status(200).json({
    data: activityService.getActivityTemplate(),
    error: null
  })
});

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

router.post("/activities", async (req, res, next) => {
  const { organizationId, activityTemplateId } = req.query;
  const data = req.body;
  try {
    await activityService.recordActivityAndAttendance(organizationId, activityTemplateId, data)
    res.status(201).json({
      data: "successed",
      error: null
    })
  } catch (error) {
    next(error)
  }
})

export default router;
