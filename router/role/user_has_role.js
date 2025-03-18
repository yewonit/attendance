import { Router } from "express";
import userHasRoleCrudRouter from "./user_has_role.crud.js";

const router = Router();

router.use("/", userHasRoleCrudRouter);

export default router;
