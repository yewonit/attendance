import { Router } from "express";
import activityInstanceCrudRouter from "./activity_instance.crud.js";

const router = Router();

router.use("/", activityInstanceCrudRouter);

export default router;
