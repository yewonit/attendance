import { Router } from "express";
import activityCategoryCrudRouter from "./activity_category.crud.js";

const router = Router();

router.use("/", activityCategoryCrudRouter);

export default router;
