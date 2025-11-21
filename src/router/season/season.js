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
 */
router.get("/next", async (req, res, next) => {
  const name = req.query.name;
  try {
    const result = await seasonService.getNextOrganization(name);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
});

export default router;

