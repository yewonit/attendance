import { Router } from "express";
import organizationCrudRouter from "./organization.crud.js";

const router = Router();

router.use("/", organizationCrudRouter);

export default router;
