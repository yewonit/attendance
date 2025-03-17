import { Router } from "express";
import attendanceStatusCrudRouter from "./attendance_status.crud.js";

const router = Router();

router.use("/", attendanceStatusCrudRouter);

export default router;
