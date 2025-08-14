import { Router } from "express";
import organizationService from "../../services/organization/organization.js";
import DomainAttendanceCtrl from "../domainCtrl/DomainAttendance.Ctrl.js";
import organizationCrudRouter from "./organization.crud.js";

const router = Router();

router.use("/", organizationCrudRouter);

// TODO - DomainAttendanceCtrl service로 분리 필요

// 조직 멤버 목록 조회
router.get("/:id/members", async (req, res, next) => {
	const organizationId = req.params.id;
	try {
		const organizationMembers =
			await organizationService.getOrganizationMembers(organizationId);

		res.status(200).json({
			members: organizationMembers.map((member) => ({
				id: member.User.id,
				name: member.User.name,
				email: member.User.email,
				roleName: member.Role.name,
			})),
		});
	} catch (error) {
		next(error);
	}
});

router.post(
	"/:organizationId/activities",
	DomainAttendanceCtrl.recordAttendance
);

// 새로운 삭제 라우트 추가
router.delete(
	"/:organizationId/activities/:activityId/instances/:activityInstanceId",
	DomainAttendanceCtrl.deleteActivityInstance
);

// 출석 기록 수정 라우트 추가
router.put(
	"/:organizationId/activities/:activityId/instances/:activityInstanceId/attendance",
	DomainAttendanceCtrl.updateAttendance
);

export default router;
