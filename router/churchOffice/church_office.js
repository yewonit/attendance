import { Router } from "express";
import churchOfficeCrudRouter from "./church_office.crud.js";

const router = Router();

router.use("/", churchOfficeCrudRouter);

export default router;
