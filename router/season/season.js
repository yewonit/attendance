import { Router } from "express";
import seasonCrudRouter from "./season.crud.js";

const router = Router();

router.use("/", seasonCrudRouter);

export default router;
