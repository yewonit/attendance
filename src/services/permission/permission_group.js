import models from "../models/models.js";
import { ValidationError } from "../utils/errors.js";
import crudService from "../common/crud.js";

const validate = async (data) => {
	if (!data.name) {
		throw new ValidationError("권한 그룹 이름은 필수입니다.");
	}
};

const permissionGroupService = {
	createPermissionGroup: crudService.create(models.PermissionGroup, validate),
	findPermissionGroup: crudService.findOne(models.PermissionGroup),
	findPermissionGroups: crudService.findAll(models.PermissionGroup),
	updatePermissionGroup: crudService.update(models.PermissionGroup, validate),
	deletePermissionGroup: crudService.delete(models.PermissionGroup),
};

export default permissionGroupService;
