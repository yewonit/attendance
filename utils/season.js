const CORAMDEO_SEASON_START_YEAR = 2024;
const CORAMDEO_SEASON_START_MONTH = 11;

const getCurrentSeasonId = (currentDate = new Date()) => {
	const seasonStartDate = new Date(
		CORAMDEO_SEASON_START_YEAR,
		CORAMDEO_SEASON_START_MONTH,
		1
	);

	let season = 0;

	while (currentDate >= seasonStartDate) {
		seasonStartDate.setFullYear(seasonStartDate.getFullYear() + 1); // 다음 시즌으로 이동
		season++;
	}

	return season;
};

export { getCurrentSeasonId };
