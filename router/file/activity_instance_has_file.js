import { Router } from "express";
import activityInstanceHasFileCrudRouter from "./activity_instance_has_file.crud.js";

const router = Router();

router.use("/", activityInstanceHasFileCrudRouter);

export default router;
