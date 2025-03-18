import { Router } from "express";
import attendanceCrudRouter from "./attendance.crud.js";

const router = Router();

router.use("/", attendanceCrudRouter);

export default router;
