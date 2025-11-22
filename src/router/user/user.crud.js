import { Router } from "express";
import userService from "../../services/user/user.js";

const router = Router();

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: ID로 사용자 조회
 *     description: 특정 ID를 가진 사용자의 정보를 조회합니다.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 성공적으로 사용자를 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: 사용자 ID
 *                 name:
 *                   type: string
 *                   description: 사용자 이름
 *                 phoneNumber:
 *                   type: string
 *                   description: 사용자 전화번호
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 새로운 사용자 생성
 *     description: 새로운 사용자를 생성합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phoneNumber
 *             properties:
 *               name:
 *                 type: string
 *                 description: 사용자 이름
 *               phoneNumber:
 *                 type: string
 *                 description: 사용자 전화번호
 *     responses:
 *       201:
 *         description: 성공적으로 사용자를 생성했습니다.
 *       400:
 *         description: 잘못된 요청입니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 모든 사용자 조회
 *     description: 시스템에 등록된 모든 사용자의 정보를 조회합니다.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: 성공적으로 사용자 목록을 조회했습니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: 사용자 ID
 *                   name:
 *                     type: string
 *                     description: 사용자 이름
 *                   phoneNumber:
 *                     type: string
 *                     description: 사용자 전화번호
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/users:
 *   put:
 *     summary: 사용자 정보 수정
 *     description: 기존 사용자의 정보를 수정합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 수정할 사용자 ID
 *               name:
 *                 type: string
 *                 description: 새로운 사용자 이름
 *               phoneNumber:
 *                 type: string
 *                 description: 새로운 사용자 전화번호
 *     responses:
 *       200:
 *         description: 성공적으로 사용자 정보를 수정했습니다.
 *       404:
 *         description: 수정할 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

/**
 * @swagger
 * /api/users:
 *   delete:
 *     summary: 사용자 삭제
 *     description: 특정 사용자를 시스템에서 삭제합니다.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: 삭제할 사용자 ID
 *     responses:
 *       200:
 *         description: 성공적으로 사용자를 삭제했습니다.
 *       404:
 *         description: 삭제할 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류가 발생했습니다.
 */

router.get("/:id", async (req, res, next) => {
	const id = req.params.id;

	try {
		const data = await userService.findUser(id);
		res.status(200).json({ data: data });
	} catch (error) {
		next(error);
	}
});

router.post("", async (req, res, next) => {
	const { userData, organizationId, idOfCreatingUser } = req.body;

	try {
		const data = await userService.createUser(
			userData,
			organizationId,
			idOfCreatingUser
		);
		res.status(201).json(data);
	} catch (error) {
		next(error);
	}
});

/**
 * 구성원 목록 조회
 * GET /api/users
 * 
 * 쿼리 파라미터 없을 때: 전체 사용자 목록 반환 (기존 동작 유지)
 * 쿼리 파라미터 있을 때: 검색/필터링/페이지네이션 지원
 * 
 * 쿼리 파라미터:
 * - search: 이름 검색어 (optional)
 * - department: 소속국 필터 (optional, 예: "1국")
 * - group: 소속그룹 필터 (optional, 예: "김민수그룹")
 * - team: 소속순 필터 (optional, 예: "이용걸순")
 * - page: 페이지 번호 (optional, 기본값: 1)
 * - limit: 페이지당 항목 수 (optional, 기본값: 10)
 */
router.get("", async (req, res, next) => {
	try {
		const { search, department, group, team, page, limit } = req.query;

		// 빈 문자열 필터링 및 정규화
		const normalizedSearch = search && search.trim() ? search.trim() : undefined;
		const normalizedDepartment = department && department.trim() ? department.trim() : undefined;
		const normalizedGroup = group && group.trim() ? group.trim() : undefined;
		const normalizedTeam = team && team.trim() ? team.trim() : undefined;
		const normalizedPage = page && parseInt(page) > 0 ? parseInt(page) : undefined;
		const normalizedLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : undefined;

		// 쿼리스트링이 있고 유효한 값이 있으면 필터링된 결과 반환
		const hasFilters = 
			normalizedSearch || 
			normalizedDepartment || 
			normalizedGroup || 
			normalizedTeam || 
			normalizedPage || 
			normalizedLimit;

		if (hasFilters) {
			// 필터링된 결과 반환 (빈 값은 제외)
			const filters = {};
			if (normalizedSearch) filters.search = normalizedSearch;
			if (normalizedDepartment) filters.department = normalizedDepartment;
			if (normalizedGroup) filters.group = normalizedGroup;
			if (normalizedTeam) filters.team = normalizedTeam;
			if (normalizedPage) filters.page = normalizedPage;
			if (normalizedLimit) filters.limit = normalizedLimit;

			const result = await userService.getMembersWithFilters(filters);

			return res.status(200).json({
				data: {
					members: result.members,
					pagination: result.pagination
				}
			});
		}

		// 쿼리스트링이 없으면 전체 목록 반환 (기존 동작 유지)
		const data = await userService.findUsers();
		return res.status(200).json({ data });
	} catch (error) {
		next(error);
	}
});

router.put("/:id", async (req, res, next) => {
	const newModel = req.body;
	const id = req.params.id;

	try {
		const updated = await userService.updateUser(id, newModel);
		res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("/:id", async (req, res, next) => {
	const id = req.params.id;

	try {
		const deleted = await userService.deleteUser(id);
		res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
