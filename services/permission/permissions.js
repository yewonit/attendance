import models from "../../models/models.js";
import { ValidationError } from "../../utils/errors.js";
import crudService from "../common/crud.js";

const validate = async (data) => {
	if (!data.permission_code) {
		throw new ValidationError("권한 코드는 필수입니다.");
	}
};

const permissionService = {
	createPermission: crudService.create(models.Permission, validate),
	findPermission: crudService.findOne(models.Permission),
	findPermissions: crudService.findAll(models.Permission),
	updatePermission: crudService.update(models.Permission, validate),
	deletePermission: crudService.delete(models.Permission),
};

export default permissionService;
