import { activityTemplate } from "../../enums/activity_template.js";

// TODO: organization의 활동 관련 서비스 구현
const activityService = {
	getActivityTemplate: () => {
		const result = []
		for (let template of Object.values(activityTemplate)) {
			result.push(template)
		}
	}
};

// 모듈을 내보내어 라우트 등 다른 파트에서 사용할 수 있도록 합니다.
export default activityService;
