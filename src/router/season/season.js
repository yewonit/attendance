import { Router } from "express";
import seasonService from "../../services/season/season.js";


const router = Router();

/**
 * POST /api/seasons
 * 회기 데이터를 일괄 생성/업데이트합니다.
 * 
 * @body {Object} body - 요청 바디
 * @body {Array} body.data - 회원 정보 배열
 * @body {string} body.data[].gook - 국
 * @body {string} body.data[].group - 그룹
 * @body {string} body.data[].soon - 순
 * @body {string} body.data[].name - 이름
 * @body {string} body.data[].name_suffix - 이름 접미사
 * @body {string} body.data[].phone - 전화번호
 * @body {string} body.data[].role - 역할
 * @body {string} body.data[].birth_date - 생년월일
 * 
 * TODO: 서비스 로직 연결 필요
 */
router.post("", async (req, res, next) => {
  const data = req.body.data;

  try {
    await seasonService.createNewSeason(data);
    res.status(201).json({ data: "success" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/seasons/next
 * 특정 유저의 다음 회기 소속 조직을 조회합니다.
 * (청년의 밤 다음 순 발표)
 * 
 * @query {string} name - 조회할 사용자 이름 (userId가 없을 때 사용)
 * @query {number} userId - 조회할 사용자 ID (우선순위: userId > name)
 */
router.get("/next", async (req, res, next) => {
  const name = req.query.name;
  const userId = req.query.userId ? parseInt(req.query.userId) : null;
  try {
    const result = await seasonService.getNextOrganization(name, userId);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/seasons/all-nations
 * 올네이션스 국 순 리스트
 */
router.get("/all-nations", async (req, res, next) => {
  try {
    const result = await seasonService.getAllNationsOrgList();
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;

