const initActivityTemplate = (
	id,
	name,
	description,
	activityCategory,
	location,
	startTime,
	endTime
) => {
	return {
		id,
		name,
		description,
		activityCategory,
		location,
		startTime,
		endTime,
	};
};

export const activityTemplate = Object.freeze({
	SUN_2: initActivityTemplate(
		1,
		"주일2부예배",
		"주일2부예배",
		"예배",
		"커버넌트홀",
		"10:00:00",
		"11:20:00"
	),
	SUN_3: initActivityTemplate(
		2,
		"주일3부예배",
		"주일3부예배",
		"예배",
		"커버넌트홀",
		"12:00:00",
		"13:20:00"
	),
	SUN_YOUNG_ADULT: initActivityTemplate(
		3,
		"청년예배",
		"청년예배",
		"예배",
		"커버넌트홀",
		"14:20:00",
		"16:10:00"
	),
	WED_YOUNG_ADULT: initActivityTemplate(
		4,
		"수요청년예배",
		"수요청년예배",
		"예배",
		"스카이아트홀",
		"21:20:00",
		"22:20:00"
	),
	FRI_YOUNG_ADULT: initActivityTemplate(
		5,
		"금요청년예배",
		"금요청년예배",
		"예배",
		"스카이아트홀",
		"22:30:00",
		"23:20:00"
	),
});
