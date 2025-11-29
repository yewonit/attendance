import getContinuousMembers from "./modules/continuousMembers.js";
import {
	getRecentSundayAttendance,
	recentSundayAttendanceToExcel,
} from "./modules/recentSunday.js";
import getWeeklyAttendanceAggregation from "./modules/weeklyAttendanceAggregation.js";
import getWeeklyAttendanceGraph from "./modules/weeklyAttendanceGraph.js";
import getYoungAdultAttendanceTrend from "./modules/youngAdultAttendanceTrend.js";

const attendanceService = {
	getWeeklyAttendanceAggregation,

	getWeeklyAttendanceGraph,

	getContinuousMembers,

	getYoungAdultAttendanceTrend,

	getRecentSundayAttendance,

	recentSundayAttendanceToExcel,
};

export default attendanceService;
