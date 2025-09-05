import getWeeklyAttendanceAggregation from "./weeklyAttendanceAggregation.js";
import getWeeklyAttendanceGraph from "./weeklyAttendanceGraph.js";
import getContinuousMembers from "./continuousMembers.js";
import getYoungAdultAttendanceTrend from "./youngAdultAttendanceTrend.js";

const attendanceService = {
	getWeeklyAttendanceAggregation,

	getWeeklyAttendanceGraph,

	getContinuousMembers,

	getYoungAdultAttendanceTrend,
};

export default attendanceService;
