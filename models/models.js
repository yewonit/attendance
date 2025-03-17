import { Sequelize } from "sequelize";
import sequelize from "../utils/database.js"
import UserModel from "./model_archive/user/User.Model.js"
import OrganizationModel from "./model_archive/organization/Organization.Model.js"
import RoleModel from "./model_archive/organization/Role.Model.js"
import UserHasRoleModel from "./model_archive/role/UserHasRole.Model.js"
import ActivityCategoryModel from "./model_archive/attendance/ActivityCategory.Model.js";
import ActivityModel from "./model_archive/attendance/Activity.Model.js";
import ActivityChangeHistoryModel from "./model_archive/attendance/ActivityChangeHistory.Model.js";
import ActivityHasFileModel from "./model_archive/file/ActivityHasFile.Model.js";
import ActivityInstanceHasFileModel from "./model_archive/file/ActivityInstanceHasFile.Model.js";
import ActivityInstanceModel from "./model_archive/attendance/ActivityInstance.Model.js";
import AttendanceStatusModel from "./model_archive/attendance/AttendanceStatus.Model.js";
import AttendanceModel from "./model_archive/attendance/Attendance.Model.js";
import FileModel from "./model_archive/file/File.Model.js";
import VisitationModel from "./model_archive/visitation/Visitation.Model.js";
import SeasonModel from "./model_archive/season/Season.Model.js";
import ChurchOfficeModel from "./model_archive/churchOffice/ChurchOffice.Model.js";
import UserHasChurchOfficeModel from "./model_archive/churchOffice/UserHasChurchOffice.Model.js";

const User = UserModel(sequelize, Sequelize);
const Organization = OrganizationModel(sequelize, Sequelize);
const Role = RoleModel(sequelize, Sequelize);
const UserHasRole = UserHasRoleModel(sequelize, Sequelize);
const ActivityCategory = ActivityCategoryModel(sequelize, Sequelize);
const Activity = ActivityModel(sequelize, Sequelize);
const ActivityInstance = ActivityInstanceModel(sequelize, Sequelize); 
const AttendanceStatus = AttendanceStatusModel(sequelize, Sequelize);
const Attendance = AttendanceModel(sequelize, Sequelize);
const ActivityChangeHistory = ActivityChangeHistoryModel(sequelize, Sequelize);
const File = FileModel(sequelize, Sequelize);
const ActivityHasFile = ActivityHasFileModel(sequelize, Sequelize);
const ActivityInstanceHasFile = ActivityInstanceHasFileModel(sequelize, Sequelize);
const Visitation = VisitationModel(sequelize, Sequelize);
const Season = SeasonModel(sequelize, Sequelize);
const ChurchOffice = ChurchOfficeModel(sequelize, Sequelize);
const UserHasChurchOffice = UserHasChurchOfficeModel(sequelize, Sequelize);

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

Activity.hasMany(ActivityChangeHistory, { foreignKey: "activity_id" });
ActivityChangeHistory.belongsTo(Activity, { foreignKey: "activity_id" });

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

User.hasMany(Visitation, { as: "VisitsMade", foreignKey: "visitor_id" });
Visitation.belongsTo(User, { as: "Visitor", foreignKey: "visitor_id" });

User.hasMany(Visitation, { as: "VisitsReceived", foreignKey: "visitee_id" });
Visitation.belongsTo(User, { as: "Visitee", foreignKey: "visitee_id" });

// // ActivityChangeHistory와 ActivityInstance 사이의 관계 수정
// ActivityInstance.hasMany(ActivityChangeHistory, {
//   foreignKey: "activity_instance_id",
// });
// ActivityChangeHistory.belongsTo(ActivityInstance, {
//   foreignKey: "activity_instance_id",
// });

Activity.hasMany(ActivityChangeHistory, { foreignKey: "activity_id" });
ActivityChangeHistory.belongsTo(Activity, { foreignKey: "activity_id" });

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

User.hasMany(UserHasChurchOffice, { foreignKey: "user_id" });
UserHasChurchOffice.belongsTo(User, { foreignKey: "user_id" });

ChurchOffice.hasMany(UserHasChurchOffice, { foreignKey: "church_office_id" });
UserHasChurchOffice.belongsTo(ChurchOffice, { foreignKey: "church_office_id" });
UserHasChurchOffice.belongsTo(User, { foreignKey: "user_id" })


// 📦 모듈 내보내기
export {
	User,
	Organization,
	Role,
	UserHasRole,
	ActivityCategory,
	Activity,
	ActivityInstance,
	AttendanceStatus,
	Attendance,
	ActivityChangeHistory,
	File,
	ActivityHasFile,
	ActivityInstanceHasFile,
	Visitation,
	Season,
	ChurchOffice,
	UserHasChurchOffice,
};
