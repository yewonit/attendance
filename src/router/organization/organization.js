import { Router } from "express";
import organizationService from "../../services/organization/organization.js";
import organizationCrudRouter from "./organization.crud.js";

const router = Router();

router.use("/", organizationCrudRouter);

// 조직 멤버 목록 조회
router.get("/:id/members", async (req, res, next) => {
	const organizationId = req.params.id;
	try {
		const organizationMembers =
			await organizationService.getOrganizationMembers(organizationId);

		res.status(200).json({
			members: organizationMembers
		});
	} catch (error) {
		next(error);
	}
});

export default router;
