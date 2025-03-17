import { Router } from "express";
import activityHasFileCrudRouter from "./activity_has_file.crud.js";

const router = Router();

router.use("/", activityHasFileCrudRouter);

export default router;
