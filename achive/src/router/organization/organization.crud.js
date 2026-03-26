import { Router } from "express";
import organizationService from "../../services/organization/organization.js";

const router = Router();

router.post("", async (req, res, next) => {
	const newOrganization = req.body;
	try {
		const data = await organizationService.createOrganization(newOrganization);
		res.status(201).json({ data: data });
	} catch (error) {
		next(error);
	}
});

/**
 * 조직 목록 조회
 * GET /api/organizations
 * 
 * 쿼리 파라미터 없을 때: 전체 조직 목록 반환 (기존 동작 유지)
 * 쿼리 파라미터 있을 때: filter-options=true면 필터 옵션 반환
 * 
 * 쿼리 파라미터:
 * - filter-options: "true"일 때 필터 옵션(소속국/소속그룹/소속순 목록) 반환 (optional)
 */
router.get("", async (req, res, next) => {
	try {
		const { filterOptions } = req.query;

		// filter-options=true면 필터 옵션 반환
		if (filterOptions) {
			const options = await organizationService.getFilterOptions();
			return res.status(200).json({
				data: options
			});
		}

		// 아니면 전체 조직 목록 반환 (기존 동작 유지)
		const data = await organizationService.findOrganizations();
		return res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const data = await organizationService.findOrganization(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.put("/:id", async (req, res, next) => {
	const newModel = req.body;
	const id = req.params.id;
	try {
		const updated = await organizationService.updateOrganization(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("/:id", async (req, res, next) => {
	const id = req.params.id;
	try {
		const deleted = await organizationService.deleteOrganization(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
