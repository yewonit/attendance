import { Router } from "express";
import fileCrudRouter from "./file.crud.js";

const router = Router();

router.use("/", fileCrudRouter);

export default router;
