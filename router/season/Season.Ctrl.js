const models = require("../../../models/models");
const crudController = require("../common/crud.Ctrl");

const validateSeasonData = async (data) => {
	if (!data.season_name) {
		const error = new Error("시즌 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const seasonController = {
	createSeason: crudController.create(models.Season, validateSeasonData),
	readSeasons: crudController.readAll(models.Season),
	readSeason: crudController.readOne(models.Season),
	updateSeason: crudController.update(models.Season, validateSeasonData),
	deleteSeason: crudController.delete(models.Season),
};

module.exports = seasonController;
