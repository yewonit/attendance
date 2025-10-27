import getWeeklyAttendanceAggregation from "./weeklyAttendanceAggregation.js";
import getWeeklyAttendanceGraph from "./weeklyAttendanceGraph.js";
import getContinuousMembers from "./continuousMembers.js";
import getYoungAdultAttendanceTrend from "./youngAdultAttendanceTrend.js";
import {
	getRecentSundayAttendance,
	recentSundayAttendanceToExcel,
} from "./recentSunday.js";

const attendanceService = {
	getWeeklyAttendanceAggregation,

	getWeeklyAttendanceGraph,

	getContinuousMembers,

	getYoungAdultAttendanceTrend,

	getRecentSundayAttendance,

	recentSundayAttendanceToExcel,
};

export default attendanceService;
