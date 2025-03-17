import models from "../../../models/models";
import crudService from "../common/crud.js";

const validateSeasonData = async (data) => {
	if (!data.season_name) {
		const error = new Error("시즌 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const seasonService = {
	createSeason: crudService.create(models.Season, validateSeasonData),
	findSeasons: crudService.findAll(models.Season),
	findSeason: crudService.findOne(models.Season),
	updateSeason: crudService.update(models.Season, validateSeasonData),
	deleteSeason: crudService.delete(models.Season),
};

export default seasonService;
