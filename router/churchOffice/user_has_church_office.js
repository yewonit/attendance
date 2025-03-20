import { Router } from "express";
import userHasChurchOfficeCrudRouter from "./user_has_church_office.crud.js";

const router = Router();

router.use("/", userHasChurchOfficeCrudRouter);

export default router;
