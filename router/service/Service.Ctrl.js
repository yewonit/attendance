const models = require("../../../models/models");
const crudController = require("../../services/common/crud.Ctrl");

const validateServiceData = async (data) => {
	if (!data.service_name) {
		const error = new Error("예배 이름이 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.organization_id) {
		const error = new Error("조직 ID가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const serviceController = {
	createService: crudController.create(models.Service, validateServiceData),
	readServices: crudController.readAll(models.Service),
	readService: crudController.readOne(models.Service),
	updateService: crudController.update(models.Service, validateServiceData),
	deleteService: crudController.delete(models.Service),
};

module.exports = serviceController;
