import models from "../../../models/models.js";

/**
 * 새로운 회기 생성 또는 조회
 * - 현재 년도 + 1 한 년도가 season 테이블에 name으로 존재하는지 체크
 * - 존재하면 해당 데이터의 id를 반환
 * - 존재하지 않으면 새로운 회기를 생성하고 id를 반환
 * 
 * @returns {Promise<number>} 회기 ID
 */
const createNewSeason = async () => {
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const seasonName = nextYear.toString();

  // 해당 년도의 회기가 이미 존재하는지 체크
  let season = await models.Season.findOne({
    where: {
      name: seasonName,
      is_deleted: false,
    },
  });

  // 존재하지 않으면 새로운 회기 생성
  if (!season) {
    season = await models.Season.create({
      name: seasonName,
      is_deleted: false,
    });
  }

  return season.id;
}

export { createNewSeason };
