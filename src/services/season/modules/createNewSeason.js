import models from "../../../models/models.js";

/**
 * 주어진 년도 11월의 마지막 일요일 이후 첫 수요일의 21:20:00을 반환
 * @param {number} year - 계산할 년도
 * @returns {Date} 11월 마지막 일요일 이후 첫 수요일 21:20:00
 */
const getFirstWednesdayAfterLastSundayOfNovember = (year) => {
  // 11월의 마지막 날짜 구하기
  const lastDayOfNovember = new Date(year, 10, 30); // 11월은 0부터 시작하므로 10
  
  // 11월의 마지막 일요일 찾기
  let lastSunday = new Date(lastDayOfNovember);
  while (lastSunday.getDay() !== 0) { // 0은 일요일
    lastSunday.setDate(lastSunday.getDate() - 1);
  }
  
  // 마지막 일요일 이후 첫 수요일 찾기
  const firstWednesday = new Date(lastSunday);
  const daysUntilWednesday = (3 - lastSunday.getDay() + 7) % 7;
  firstWednesday.setDate(lastSunday.getDate() + (daysUntilWednesday === 0 ? 7 : daysUntilWednesday));
  
  // 21:20:00으로 설정
  firstWednesday.setHours(21, 20, 0, 0);
  
  return firstWednesday;
};

/**
 * 새로운 회기 생성 또는 조회
 * - 현재 년도 + 1 한 년도가 season 테이블에 name으로 존재하는지 체크
 * - 존재하면 해당 데이터의 id를 반환
 * - 존재하지 않으면 새로운 회기를 생성하고 id를 반환
 * - start_date: 이전 회기의 end_date
 * - end_date: 다음 년도 11월 마지막 일요일 이후 첫 수요일의 21:20:00
 * - end_delay: null
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
    // 이전 회기 조회 (현재 년도)
    const previousSeason = await models.Season.findOne({
      where: {
        name: currentYear.toString(),
        is_deleted: false,
      },
    });

    // start_date: 이전 회기의 end_date
    const startDate = previousSeason ? previousSeason.end_date : null;

    // end_date: 다음 년도 11월 마지막 일요일 이후 첫 수요일의 21:20:00
    const endDate = getFirstWednesdayAfterLastSundayOfNovember(nextYear);

    season = await models.Season.create({
      name: seasonName,
      start_date: startDate,
      end_date: endDate,
      end_delay: null,
      is_deleted: false,
    });
  }

  return season.id;
}

export { createNewSeason };
