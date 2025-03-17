import { Router } from "express";
import roleCrudRouter from "./role.crud.js";

const router = Router();

router.use("/", roleCrudRouter);

export default router;
