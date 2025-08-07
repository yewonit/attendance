import { Sequelize } from "sequelize";
import { sequelize } from "../utils/database.js";
import ActivityModel from "./activity/activity.js";
import ActivityImageModel from "./image/activity_image.js";
import AttendanceModel from "./attendance/attendance.js";
import OrganizationModel from "./organization/organization.js";
import RoleModel from "./role/role.js";
import SeasonModel from "./season/season.js";
import UserModel from "./user/user.js";
import UserRoleModel from "./role/user_role.js";
import PermissionModel from "./permission/permission.js";
import RolePermissionModel from "./permission/role_permission.js";

const User = UserModel(sequelize, Sequelize);
const Organization = OrganizationModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const Activity = ActivityModel(sequelize, Sequelize);
const ActivityImage = ActivityImageModel(sequelize, Sequelize);
const Attendance = AttendanceModel(sequelize, Sequelize);
const Season = SeasonModel(sequelize, Sequelize);
const Permission = PermissionModel(sequelize, Sequelize);
const RolePermission = RolePermissionModel(sequelize, Sequelize);
const UserRole = UserRoleModel(sequelize, Sequelize);

export default {
	Activity,
	ActivityImage,
	Attendance,
	Organization,
	Role,
	RolePermission,
	Season,
	User,
	UserRole,
	Permission,
};
