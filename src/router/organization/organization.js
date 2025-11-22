import { Router } from "express";
import organizationService from "../../services/organization/organization.js";
import organizationCrudRouter from "./organization.crud.js";

const router = Router();

// ⚠️ 중요: 구체적인 경로를 router.use() 이전에 정의해야 함!
// router.use()가 먼저 실행되면 모든 요청을 가로챕니다.

/**
 * 📊 모든 조직의 멤버 수 조회 API (N+1 쿼리 문제 해결)
 * GET /organizations/member-counts
 */
router.get("/member-counts", async (req, res, next) => {
	try {
		const memberCounts =
			await organizationService.getAllOrganizationMemberCounts();

		res.status(200).json({
			data: memberCounts,
		});
	} catch (error) {
		console.error("조직별 멤버 수 조회 실패:", error);
		next(error);
	}
});

// 조직 멤버 목록 조회
router.get("/:id/members", async (req, res, next) => {
	const organizationId = req.params.id;
	try {
		const organizationMembers =
			await organizationService.getOrganizationMembers(organizationId);

		res.status(200).json({
			members: organizationMembers,
		});
	} catch (error) {
		next(error);
	}
});

router.get("/:id/members/roles", async (req, res, next) => {
	const organizationId = req.params.id;
	try {
		const organizationMembers =
			await organizationService.getMembersByIdWithRoles(organizationId);

		res.status(200).json(organizationMembers);
	} catch (error) {
		next(error);
	}
});

/**
 * 필터 옵션 조회
 * GET /api/organizations/filter-options
 * 
 * 현재 시즌의 소속국/소속그룹/소속순 목록을 조회합니다.
 */
router.get("/filter-options", async (req, res, next) => {
	try {
		const filterOptions = await organizationService.getFilterOptions();

		res.status(200).json({
			data: filterOptions
		});
	} catch (error) {
		next(error);
	}
});

// CRUD 라우터는 마지막에 통합 (가장 일반적인 패턴이므로)
router.use("/", organizationCrudRouter);

export default router;
