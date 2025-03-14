const models = require("../../../models/models");
const crudController = require("../common/crud");

const validateUserHasChurchOfficeData = async (data) => {
	if (!data.user_id) {
		const error = new Error("사용자 ID가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	if (!data.church_office_id) {
		const error = new Error("직분 ID가 누락되었습니다.");
		error.status = 400;
		throw error;
	}
	// 추가 유효성 검사 로직이 필요한 경우 여기에 구현
};

const userHasChurchOfficeController = {
	createUserHasChurchOffice: crudController.create(
		models.UserHasChurchOffice,
		validateUserHasChurchOfficeData
	),
	readUserHasChurchOffices: crudController.readAll(models.UserHasChurchOffice),
	readUserHasChurchOffice: crudController.readOne(models.UserHasChurchOffice),
	updateUserHasChurchOffice: crudController.update(
		models.UserHasChurchOffice,
		validateUserHasChurchOfficeData
	),
	deleteUserHasChurchOffice: crudController.delete(models.UserHasChurchOffice),
};

module.exports = userHasChurchOfficeController;
