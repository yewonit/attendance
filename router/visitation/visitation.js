import { Router } from "express";
import visitationCrudRouter from "./visitation.crud.js";

const router = Router();

router.use("/", visitationCrudRouter);

export default router;
