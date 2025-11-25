import { Sequelize } from "sequelize";
import { sequelize } from "../utils/database.js";
import ActivityModel from "./activity/activity.js";
import AttendanceModel from "./attendance/attendance.js";
import UserAttendanceStatusModel from "./attendance/user_attendance_status.js";
import ActivityImageModel from "./image/activity_image.js";
import OrganizationModel from "./organization/organization.js";
import PermissionModel from "./permission/permission.js";
import RolePermissionModel from "./permission/role_permission.js";
import RoleModel from "./role/role.js";
import UserRoleModel from "./role/user_role.js";
import SeasonModel from "./season/season.js";
import UserModel from "./user/user.js";

const User = UserModel(sequelize, Sequelize);
const Organization = OrganizationModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const Activity = ActivityModel(sequelize, Sequelize);
const ActivityImage = ActivityImageModel(sequelize, Sequelize);
const Attendance = AttendanceModel(sequelize, Sequelize);
const UserAttendanceStatus = UserAttendanceStatusModel(sequelize, Sequelize);
const Season = SeasonModel(sequelize, Sequelize);
const Permission = PermissionModel(sequelize, Sequelize);
const RolePermission = RolePermissionModel(sequelize, Sequelize);
const UserRole = UserRoleModel(sequelize, Sequelize);

Organization.belongsTo(Season, { foreignKey: "season_id", as: "season" });
Season.hasMany(Organization, { foreignKey: "season_id", as: "organizations" });

Organization.belongsTo(Organization, { foreignKey: "upper_organization_id", as: "parent" });
Organization.hasMany(Organization, { foreignKey: "upper_organization_id", as: "children" });

Activity.belongsTo(Organization, { foreignKey: "organization_id", as: "organization" });
Organization.hasMany(Activity, { foreignKey: "organization_id", as: "activities" });

ActivityImage.belongsTo(Activity, { foreignKey: "activity_id", as: "activity" });
Activity.hasMany(ActivityImage, { foreignKey: "activity_id", as: "images" });

Attendance.belongsTo(Activity, { foreignKey: "activity_id", as: "activity" });
Activity.hasMany(Attendance, { foreignKey: "activity_id", as: "attendances" });

Attendance.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Attendance, { foreignKey: "user_id", as: "attendances" });

UserAttendanceStatus.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(UserAttendanceStatus, { foreignKey: "user_id", as: "attendanceStatuses" });

User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id", otherKey: "role_id", as: "roles" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id", otherKey: "user_id", as: "users" });

UserRole.belongsTo(User, { foreignKey: "user_id", as: "user" });
UserRole.belongsTo(Role, { foreignKey: "role_id", as: "role" });
UserRole.belongsTo(Organization, { foreignKey: "organization_id", as: "organization" });
User.hasMany(UserRole, { foreignKey: "user_id", as: "userRoles" });
Role.hasMany(UserRole, { foreignKey: "role_id", as: "userRoles" });
Organization.hasMany(UserRole, { foreignKey: "organization_id", as: "userRoles" });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "role_id", otherKey: "permission_id", as: "permissions" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permission_id", otherKey: "role_id", as: "roles" });

RolePermission.belongsTo(Role, { foreignKey: "role_id", as: "role" });
RolePermission.belongsTo(Permission, { foreignKey: "permission_id", as: "permission" });
Role.hasMany(RolePermission, { foreignKey: "role_id", as: "rolePermissions" });
Permission.hasMany(RolePermission, { foreignKey: "permission_id", as: "rolePermissions" });

export default {
	Activity,
	ActivityImage,
	Attendance,
	UserAttendanceStatus,
	Organization,
	Role,
	RolePermission,
	Season,
	User,
	UserRole,
	Permission,
};
