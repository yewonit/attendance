import { Sequelize } from "sequelize";
import { sequelize } from "../utils/database.js";
import ActivityModel from "./model_archive/attendance/activity.js";
import ActivityCategoryModel from "./model_archive/attendance/activity_category.js";
import ActivityInstanceModel from "./model_archive/attendance/activity_instance.js";
import AttendanceModel from "./model_archive/attendance/attendance.js";
import AttendanceStatusModel from "./model_archive/attendance/attendance_status.js";
import ActivityHasFileModel from "./model_archive/file/activity_has_file.js";
import ActivityInstanceHasFileModel from "./model_archive/file/activity_instance_has_file.js";
import FileModel from "./model_archive/file/file.js";
import OrganizationModel from "./model_archive/organization/organization.js";
import RoleModel from "./model_archive/role/role.js";
import UserHasRoleModel from "./model_archive/role/user_has_role.js";
import SeasonModel from "./model_archive/season/season.js";
import UserModel from "./model_archive/user/user.js";
import PermissionModel from "./model_archive/permission/permissions.js";
import PermissionGroupModel from "./model_archive/permission/permission_group.js";
import PermissionGroupHasPermissionModel from "./model_archive/permission/permission_group_has_permission.js";

const User = UserModel(sequelize, Sequelize);
const Organization = OrganizationModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const UserHasRole = UserHasRoleModel(sequelize, Sequelize);
const ActivityCategory = ActivityCategoryModel(sequelize, Sequelize);
const Activity = ActivityModel(sequelize, Sequelize);
const ActivityInstance = ActivityInstanceModel(sequelize, Sequelize);
const AttendanceStatus = AttendanceStatusModel(sequelize, Sequelize);
const Attendance = AttendanceModel(sequelize, Sequelize);
const File = FileModel(sequelize, Sequelize);
const ActivityHasFile = ActivityHasFileModel(sequelize, Sequelize);
const ActivityInstanceHasFile = ActivityInstanceHasFileModel(
	sequelize,
	Sequelize
);
const Season = SeasonModel(sequelize, Sequelize);
const Permission = PermissionModel(sequelize, Sequelize);
const PermissionGroup = PermissionGroupModel(sequelize, Sequelize);
const PermissionGroupHasPermission = PermissionGroupHasPermissionModel(
	sequelize,
	Sequelize
);

// 모델 간 관계 설정
User.hasMany(UserHasRole, { foreignKey: "user_id" });
UserHasRole.belongsTo(User, { foreignKey: "user_id" });

Organization.hasMany(Role, { foreignKey: "organization_id" });
Role.belongsTo(Organization, { foreignKey: "organization_id" });

Organization.hasMany(UserHasRole, { foreignKey: "organization_id" });
UserHasRole.belongsTo(Organization, { foreignKey: "organization_id" });

Organization.hasMany(Activity, { foreignKey: "organization_id" });
Activity.belongsTo(Organization, { foreignKey: "organization_id" });

Role.hasMany(UserHasRole, { foreignKey: "role_id" });
UserHasRole.belongsTo(Role, { foreignKey: "role_id" });

ActivityCategory.hasMany(Activity, { foreignKey: "activity_category_id" });
Activity.belongsTo(ActivityCategory, { foreignKey: "activity_category_id" });

ActivityCategory.hasMany(ActivityCategory, {
	as: "Children",
	foreignKey: "parent_id",
});
ActivityCategory.belongsTo(ActivityCategory, {
	as: "Parent",
	foreignKey: "parent_id",
});

Activity.hasMany(ActivityInstance, { foreignKey: "activity_id" });
ActivityInstance.belongsTo(Activity, { foreignKey: "activity_id" });

ActivityInstance.hasMany(ActivityInstance, {
	as: "ChildInstances",
	foreignKey: "parent_instance_id",
});
ActivityInstance.belongsTo(ActivityInstance, {
	as: "ParentInstance",
	foreignKey: "parent_instance_id",
});

ActivityInstance.hasMany(Attendance, { foreignKey: "activity_instance_id" });
Attendance.belongsTo(ActivityInstance, { foreignKey: "activity_instance_id" });

AttendanceStatus.hasMany(Attendance, { foreignKey: "attendance_status_id" });
Attendance.belongsTo(AttendanceStatus, { foreignKey: "attendance_status_id" });

User.hasMany(Attendance, { foreignKey: "user_id" });
Attendance.belongsTo(User, { foreignKey: "user_id" });

File.hasMany(ActivityHasFile, { foreignKey: "file_id" });
ActivityHasFile.belongsTo(File, { foreignKey: "file_id" });

File.hasMany(ActivityInstanceHasFile, { foreignKey: "file_id" });
ActivityInstanceHasFile.belongsTo(File, { foreignKey: "file_id" });

Activity.hasMany(ActivityHasFile, { foreignKey: "activity_id" });
ActivityHasFile.belongsTo(Activity, { foreignKey: "activity_id" });

ActivityInstance.hasMany(ActivityInstanceHasFile, {
	foreignKey: "activity_instance_id",
});
ActivityInstanceHasFile.belongsTo(ActivityInstance, {
	foreignKey: "activity_instance_id",
});

// // ActivityChangeHistory와 ActivityInstance 사이의 관계 수정
// ActivityInstance.hasMany(ActivityChangeHistory, {
//   foreignKey: "activity_instance_id",
// });
// ActivityChangeHistory.belongsTo(ActivityInstance, {
//   foreignKey: "activity_instance_id",
// });

ActivityInstance.belongsToMany(File, {
	through: ActivityInstanceHasFile,
	foreignKey: "activity_instance_id",
	otherKey: "file_id",
	as: "Images",
});

File.belongsToMany(ActivityInstance, {
	through: ActivityInstanceHasFile,
	foreignKey: "file_id",
	otherKey: "activity_instance_id",
	as: "ActivityInstances",
});

Permission.hasMany(PermissionGroupHasPermission, {
	foreignKey: "permission_id",
});
PermissionGroup.hasMany(PermissionGroupHasPermission, {
	foreignKey: "permission_group_id",
});
PermissionGroupHasPermission.belongsTo(Permission, {
	foreignKey: "permission_id",
});
PermissionGroupHasPermission.belongsTo(PermissionGroup, {
	foreignKey: "permission_group_id",
});
PermissionGroup.hasMany(Role, { foreignKey: "permission_group_id" });
Role.belongsTo(PermissionGroup, { foreignKey: "permission_group_id" });

// 📦 모듈 내보내기
export default {
	Activity,
	ActivityCategory,
	ActivityHasFile,
	ActivityInstance,
	ActivityInstanceHasFile,
	Attendance,
	AttendanceStatus,
	File,
	Organization,
	Role,
	Season,
	User,
	UserHasRole,
	Permission,
	PermissionGroup,
	PermissionGroupHasPermission,
};
