const { Sequelize } = require("sequelize")
const env = require("../config/environment")

// 📚 데이터베이스 연결 설정
const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
	host: env.DB_HOST,
	dialect: "mysql",
})

// 🙋‍♂️ User 모델 그룹
const User = require("./model_archive/user/User.Model")(sequelize, Sequelize)

// 🏢 Organization 모델 그룹
const Organization =
	require("./model_archive/organizationAndRole/Organization.Model")(
		sequelize,
		Sequelize
	)
const Role = require("./model_archive/organizationAndRole/Role.Model")(
	sequelize,
	Sequelize
)
const UserHasRole =
	require("./model_archive/organizationAndRole/UserHasRole.Model")(
		sequelize,
		Sequelize
	)

// 📅 Attendance 모델 그룹
const ActivityCategory =
	require("./model_archive/attendance/ActivityCategory.Model")(
		sequelize,
		Sequelize
	)
const Activity = require("./model_archive/attendance/Activity.Model")(
	sequelize,
	Sequelize
)
const ActivityRecurrence =
	require("./model_archive/attendance/ActivityRecurrence.Model")(
		sequelize,
		Sequelize
	)
const ActivityInstance =
	require("./model_archive/attendance/ActivityInstance.Model")(
		sequelize,
		Sequelize
	)
const AttendanceStatus =
	require("./model_archive/attendance/AttendanceStatus.Model")(
		sequelize,
		Sequelize
	)
const Attendance = require("./model_archive/attendance/Attendance.Model")(
	sequelize,
	Sequelize
)
const ActivityChangeHistory =
	require("./model_archive/attendance/ActivityChangeHistory.Model")(
		sequelize,
		Sequelize
	)
const ActivityStatistics =
	require("./model_archive/attendance/ActivityStatistics.Model")(
		sequelize,
		Sequelize
	)

// 📁 File 모델 그룹
const File = require("./model_archive/file/File.Model")(sequelize, Sequelize)
const ActivityHasFile = require("./model_archive/file/ActivityHasFile.Model")(
	sequelize,
	Sequelize
)
const ActivityInstanceHasFile =
	require("./model_archive/file/ActivityInstanceHasFile.Model")(
		sequelize,
		Sequelize
	)

// 🙋🏻‍♂️ Visitation 모델 그룹
const Visitation = require("./model_archive/visitation/Visitation.Model")(
	sequelize,
	Sequelize
)

// 🔗️ Season 모델 그룹
const Season = require("./model_archive/season/Season.Model")(
	sequelize,
	Sequelize
)

// 🔗 모델 간 관계 설정
User.hasMany(UserHasRole, { foreignKey: "user_id" })
UserHasRole.belongsTo(User, { foreignKey: "user_id" })

Organization.hasMany(Role, { foreignKey: "organization_id" })
Role.belongsTo(Organization, { foreignKey: "organization_id" })

Organization.hasMany(UserHasRole, { foreignKey: "organization_id" })
UserHasRole.belongsTo(Organization, { foreignKey: "organization_id" })

Organization.hasMany(Activity, { foreignKey: "organization_id" })
Activity.belongsTo(Organization, { foreignKey: "organization_id" })

Role.hasMany(UserHasRole, { foreignKey: "role_id" })
UserHasRole.belongsTo(Role, { foreignKey: "role_id" })

ActivityCategory.hasMany(Activity, { foreignKey: "activity_category_id" })
Activity.belongsTo(ActivityCategory, { foreignKey: "activity_category_id" })

ActivityCategory.hasMany(ActivityCategory, {
	as: "Children",
	foreignKey: "parent_id",
})
ActivityCategory.belongsTo(ActivityCategory, {
	as: "Parent",
	foreignKey: "parent_id",
})

Activity.hasMany(ActivityRecurrence, { foreignKey: "activity_id" })
ActivityRecurrence.belongsTo(Activity, { foreignKey: "activity_id" })

Activity.hasMany(ActivityInstance, { foreignKey: "activity_id" })
ActivityInstance.belongsTo(Activity, { foreignKey: "activity_id" })

ActivityInstance.hasMany(ActivityInstance, {
	as: "ChildInstances",
	foreignKey: "parent_instance_id",
})
ActivityInstance.belongsTo(ActivityInstance, {
	as: "ParentInstance",
	foreignKey: "parent_instance_id",
})

ActivityInstance.hasMany(Attendance, { foreignKey: "activity_instance_id" })
Attendance.belongsTo(ActivityInstance, { foreignKey: "activity_instance_id" })

AttendanceStatus.hasMany(Attendance, { foreignKey: "attendance_status_id" })
Attendance.belongsTo(AttendanceStatus, { foreignKey: "attendance_status_id" })

User.hasMany(Attendance, { foreignKey: "user_id" })
Attendance.belongsTo(User, { foreignKey: "user_id" })

Activity.hasMany(ActivityChangeHistory, { foreignKey: "activity_id" })
ActivityChangeHistory.belongsTo(Activity, { foreignKey: "activity_id" })

Activity.hasMany(ActivityStatistics, { foreignKey: "activity_id" })
ActivityStatistics.belongsTo(Activity, { foreignKey: "activity_id" })

File.hasMany(ActivityHasFile, { foreignKey: "file_id" })
ActivityHasFile.belongsTo(File, { foreignKey: "file_id" })

File.hasMany(ActivityInstanceHasFile, { foreignKey: "file_id" })
ActivityInstanceHasFile.belongsTo(File, { foreignKey: "file_id" })

Activity.hasMany(ActivityHasFile, { foreignKey: "activity_id" })
ActivityHasFile.belongsTo(Activity, { foreignKey: "activity_id" })

ActivityInstance.hasMany(ActivityInstanceHasFile, {
	foreignKey: "activity_instance_id",
})
ActivityInstanceHasFile.belongsTo(ActivityInstance, {
	foreignKey: "activity_instance_id",
})

User.hasMany(Visitation, { as: "VisitsMade", foreignKey: "visitor_id" })
Visitation.belongsTo(User, { as: "Visitor", foreignKey: "visitor_id" })

User.hasMany(Visitation, { as: "VisitsReceived", foreignKey: "visitee_id" })
Visitation.belongsTo(User, { as: "Visitee", foreignKey: "visitee_id" })

// // ActivityRecurrence와 ActivityInstance 사이의 관계 추가
// ActivityRecurrence.hasMany(ActivityInstance, {
//   foreignKey: "activity_recurrence_id",
// });
// ActivityInstance.belongsTo(ActivityRecurrence, {
//   foreignKey: "activity_recurrence_id",
// // });

// // ActivityChangeHistory와 ActivityInstance 사이의 관계 수정
// ActivityInstance.hasMany(ActivityChangeHistory, {
//   foreignKey: "activity_instance_id",
// });
// ActivityChangeHistory.belongsTo(ActivityInstance, {
//   foreignKey: "activity_instance_id",
// });

// Activity와 ActivityChangeHistory 사이의 관계도 유지
Activity.hasMany(ActivityChangeHistory, { foreignKey: "activity_id" })
ActivityChangeHistory.belongsTo(Activity, { foreignKey: "activity_id" })

// 📦 모듈 내보내기
module.exports = {
	sequelize,
	User,
	Organization,
	Role,
	UserHasRole,
	ActivityCategory,
	Activity,
	ActivityRecurrence,
	ActivityInstance,
	AttendanceStatus,
	Attendance,
	ActivityChangeHistory,
	ActivityStatistics,
	File,
	ActivityHasFile,
	ActivityInstanceHasFile,
	Visitation,
	Season,
}

// Add the following relationships
ActivityInstance.belongsToMany(File, {
	through: ActivityInstanceHasFile,
	foreignKey: "activity_instance_id",
	otherKey: "file_id",
	as: "Images",
})

File.belongsToMany(ActivityInstance, {
	through: ActivityInstanceHasFile,
	foreignKey: "file_id",
	otherKey: "activity_instance_id",
	as: "ActivityInstances",
})
