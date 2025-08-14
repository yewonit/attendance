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

export default router;
