import { Router } from "express";
import activityChangeHistoryCrudRouter from "./activity_change_history.crud.js";

const router = Router();

router.use("/", activityChangeHistoryCrudRouter);

export default router;
