import { Router } from "express";
import organizationService from "../../services/organization/organization.js";
import DomainAttendanceCtrl from "../domainCtrl/DomainAttendance.Ctrl.js";
import organizationCrudRouter from "./organization.crud.js";

const router = Router();

router.use("/", organizationCrudRouter);

// TODO - DomainAttendanceCtrl service로 분리 필요

// 조직 멤버 목록 조회
router.get(
	"/:organizationId/members",
	DomainAttendanceCtrl.getOrganizationMembers
);

router.get("/:id/activities", async (req, res, next) => {
	const organizationId = req.params.id;
	try {
		const data = await organizationService.getOrganizationActivities(
			organizationId
		);

		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
});

router.post(
	"/:organizationId/activities/:activityId/attendance",
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

// 활동 인스턴스 상세 정보 조회
router.get(
	"/:organizationId/activities/:activityId/instances/:activityInstanceId",
	DomainAttendanceCtrl.getActivityInstanceDetails
);

export default router;
