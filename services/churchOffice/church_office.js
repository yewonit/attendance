import models from "../../models/models.js";
import crudService from "../common/crud.js";

const validateChurchOfficeData = async (data) => {
	if (!data.office_name) {
		const error = new Error("직분 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const churchOfficeService = {
	createChurchOffice: crudService.create(
		models.ChurchOffice,
		validateChurchOfficeData
	),
	findChurchOffices: crudService.findAll(models.ChurchOffice),
	findChurchOffice: crudService.findOne(models.ChurchOffice),
	updateChurchOffice: crudService.update(
		models.ChurchOffice,
		validateChurchOfficeData
	),
	deleteChurchOffice: crudService.delete(models.ChurchOffice),
};

export default churchOfficeService;
