import { Router } from "express";
import activityCrudRouter from "./activity.crud.js";

const router = Router();

router.use("/", activityCrudRouter);

export default router;
