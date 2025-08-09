import { Router } from "express";
import activityCrudRouter from "./activity.crud.js";

const router = Router();

// TODO: organization의활동 관련 라우터 여기로 수정 필요
router.use("/", activityCrudRouter);

export default router;
