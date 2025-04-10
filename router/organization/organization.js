import { Router } from "express";
import organizationService from "../../services/organization/organization.js";
import DomainAttendanceCtrl from "../domainCtrl/DomainAttendance.Ctrl.js";
import organizationCrudRouter from "./organization.crud.js";
import { getCurrentSeasonId } from "../../utils/season.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: 조직 관리 API
 */

/**
 * @swagger
 * /api/organizations:
 *   post:
 *     summary: 새로운 조직 생성
 *     description: 새로운 조직을 생성합니다.
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               organization_name:
 *                 type: string
 *                 description: 조직 이름
 *               organization_code:
 *                 type: string
 *                 description: 조직 코드
 *               description:
 *                 type: string
 *                 description: 조직 설명
 *     responses:
 *       201:
 *         description: 성공적으로 조직이 생성되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations:
 *   get:
 *     summary: 모든 조직 조회
 *     description: 모든 조직을 조회합니다.
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: 성공적으로 조직 목록을 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{id}:
 *   get:
 *     summary: 특정 조직 조회
 *     description: ID로 특정 조직을 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *     responses:
 *       200:
 *         description: 성공적으로 조직을 조회했습니다.
 *       404:
 *         description: 조직을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations:
 *   put:
 *     summary: 조직 정보 업데이트
 *     description: 기존 조직의 정보를 업데이트합니다.
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 조직 ID
 *               organization_name:
 *                 type: string
 *                 description: 조직 이름
 *               organization_code:
 *                 type: string
 *                 description: 조직 코드
 *               description:
 *                 type: string
 *                 description: 조직 설명
 *     responses:
 *       200:
 *         description: 성공적으로 조직이 업데이트되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 조직을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations:
 *   delete:
 *     summary: 조직 삭제
 *     description: 특정 조직을 삭제합니다.
 *     tags: [Organizations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 조직 ID
 *     responses:
 *       200:
 *         description: 성공적으로 조직이 삭제되었습니다.
 *       404:
 *         description: 조직을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{organizationId}/members:
 *   get:
 *     summary: 조직 멤버 목록 조회
 *     description: 특정 조직의 모든 멤버를 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *     responses:
 *       200:
 *         description: 성공적으로 멤버 목록을 조회했습니다.
 *       404:
 *         description: 조직을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{id}/activities:
 *   get:
 *     summary: 조직 활동 목록 조회
 *     description: 특정 조직의 모든 활동을 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *     responses:
 *       200:
 *         description: 성공적으로 활동 목록을 조회했습니다.
 *       404:
 *         description: 조직을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{organizationId}/activities/{activityId}/attendance:
 *   post:
 *     summary: 출석 기록
 *     description: 특정 활동에 대한 출석을 기록합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *               attendance_status_id:
 *                 type: integer
 *                 description: 출석 상태 ID
 *     responses:
 *       201:
 *         description: 성공적으로 출석이 기록되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 조직, 활동 또는 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}:
 *   delete:
 *     summary: 활동 인스턴스 삭제
 *     description: 특정 활동 인스턴스를 삭제합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 ID
 *       - in: path
 *         name: activityInstanceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 인스턴스 ID
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스가 삭제되었습니다.
 *       404:
 *         description: 활동 인스턴스를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}/attendance:
 *   put:
 *     summary: 출석 기록 수정
 *     description: 특정 활동 인스턴스의 출석 기록을 수정합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 ID
 *       - in: path
 *         name: activityInstanceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 인스턴스 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: 사용자 ID
 *               attendance_status_id:
 *                 type: integer
 *                 description: 출석 상태 ID
 *     responses:
 *       200:
 *         description: 성공적으로 출석 기록이 수정되었습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       404:
 *         description: 출석 기록을 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/{organizationId}/activities/{activityId}/instances/{activityInstanceId}:
 *   get:
 *     summary: 활동 인스턴스 상세 정보 조회
 *     description: 특정 활동 인스턴스의 상세 정보를 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 조직 ID
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 ID
 *       - in: path
 *         name: activityInstanceId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 활동 인스턴스 ID
 *     responses:
 *       200:
 *         description: 성공적으로 활동 인스턴스 정보를 조회했습니다.
 *       404:
 *         description: 활동 인스턴스를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/organizations/coramdeo/members:
 *   get:
 *     summary: 현재 회기의 모든 그룹 조직 및 멤버 조회
 *     description: 현재 회기의 모든 그룹 조직과 멤버를 조회합니다
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: 성공적으로 리스트를 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.get("/coramdeo/members", async (req, res, next) => {
	const seasonId = getCurrentSeasonId();
	try {
		const coramdeo = await organizationService.getCurrentSeasonCoramdeoOrg(
			seasonId
		);
		const gooks = await organizationService.getUnderOrganizationById(
			coramdeo.id
		);
		const gookWithGroup = await Promise.all(
			gooks.map(async (gook) => {
				const groups = await organizationService.getUnderOrganizationById(
					gook.id
				);
				const groupWithMembers = await Promise.all(
					groups.map(async (group) => {
						return await organizationService.getUnderOrganizationByIdWithMembers(
							group.id
						);
					})
				);
				return {
					...gook.toJSON(),
					groups: groupWithMembers,
				};
			})
		);

		res.status(200).json(gookWithGroup);
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/organizations/gooks:
 *   get:
 *     summary: 현재 회기의 국 리스트 조회
 *     description: 현재 회기 또는 특정 연도의 국 리스트를 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 조회할 연도 (선택사항)
 *     responses:
 *       200:
 *         description: 성공적으로 국 리스트를 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

// 현재 회기 또는 원하는 회기의 국 리스트 반환
router.get("/gooks", async (req, res, next) => {
	let year = req.query.year;
	let seasonId;
	if (!year) seasonId = getCurrentSeasonId();
	else seasonId = getCurrentSeasonId(new Date(year, 1, 1));

	try {
		const coramdeo = await organizationService.getCurrentSeasonCoramdeoOrg(
			seasonId
		);
		const gooks = await organizationService.getUnderOrganizationById(
			coramdeo.id
		);
		res.status(200).json(gooks);
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/organizations/groups:
 *   get:
 *     summary: 국에 소속된 그룹 조회
 *     description: 특정 국에 소속된 모든 그룹을 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: gookId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 국 ID
 *     responses:
 *       200:
 *         description: 성공적으로 그룹 리스트를 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

// 국에 소속된 그룹 반환
router.get("/groups", async (req, res, next) => {
	const gookId = req.query.gookId;
	try {
		const groups = await organizationService.getUnderOrganizationById(gookId);
		res.status(200).json(groups);
	} catch (error) {
		next(error);
	}
});

/**
 * @swagger
 * /api/organizations/groups/members:
 *   get:
 *     summary: 그룹의 순과 멤버 조회
 *     description: 특정 그룹에 소속된 모든 순과 각 순의 멤버들을 조회합니다.
 *     tags: [Organizations]
 *     parameters:
 *       - in: query
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 순과 멤버 정보를 조회했습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

// 그룹에 소속된 순과 각 순의 멤버들 반환
router.get("/groups/members", async (req, res, next) => {
	const groupId = req.query.groupId;
	try {
		const groupMembers =
			await organizationService.getUnderOrganizationByIdWithMembers(groupId);
		res.status(200).json(groupMembers);
	} catch (error) {
		next(error);
	}
});

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
				roleId: member.Role.id,
				roleName: member.Role.role_name,
				roleStartDate: member.role_start_date,
				roleEndDate: member.role_end_date,
			})),
		});
	} catch (error) {
		next(error);
	}
});

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
