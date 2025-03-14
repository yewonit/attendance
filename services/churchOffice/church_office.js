const models = require("../../../models/models");
const crudController = require("../common/crud");

const validateChurchOfficeData = async (data) => {
	if (!data.office_name) {
		const error = new Error("직분 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const churchOfficeController = {
	createChurchOffice: crudController.create(
		models.ChurchOffice,
		validateChurchOfficeData
	),
	readChurchOffices: crudController.readAll(models.ChurchOffice),
	readChurchOffice: crudController.readOne(models.ChurchOffice),
	updateChurchOffice: crudController.update(
		models.ChurchOffice,
		validateChurchOfficeData
	),
	deleteChurchOffice: crudController.delete(models.ChurchOffice),
};

module.exports = churchOfficeController;
