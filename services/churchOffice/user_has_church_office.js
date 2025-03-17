import models from "../../models/models.js";
import crudService from "../common/crud.js";

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

const userHasChurchOfficeService = {
	createUserHasChurchOffice: crudService.create(
		models.UserHasChurchOffice,
		validateUserHasChurchOfficeData
	),
	findUserHasChurchOffices: crudService.findAll(models.UserHasChurchOffice),
	findUserHasChurchOffice: crudService.findOne(models.UserHasChurchOffice),
	updateUserHasChurchOffice: crudService.update(
		models.UserHasChurchOffice,
		validateUserHasChurchOfficeData
	),
	deleteUserHasChurchOffice: crudService.delete(models.UserHasChurchOffice),
};

export default userHasChurchOfficeService;
