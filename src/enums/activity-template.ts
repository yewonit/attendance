/** 활동 템플릿 정의 — 사전 등록된 활동 유형 */

interface ActivityTemplate {
  id: number;
  name: string;
  description: string;
  activityCategory: string;
  location: string;
  startTime: string;
  endTime: string;
}

export const ACTIVITY_TEMPLATES = {
  SUN_2: {
    id: 1,
    name: '주일2부예배',
    description: '주일2부예배',
    activityCategory: '예배',
    location: '커버넌트홀',
    startTime: '10:00:00',
    endTime: '11:20:00',
  },
  SUN_3: {
    id: 2,
    name: '주일3부예배',
    description: '주일3부예배',
    activityCategory: '예배',
    location: '커버넌트홀',
    startTime: '12:00:00',
    endTime: '13:20:00',
  },
  SUN_YOUNG_ADULT: {
    id: 3,
    name: '청년예배',
    description: '청년예배',
    activityCategory: '예배',
    location: '커버넌트홀',
    startTime: '14:20:00',
    endTime: '16:10:00',
  },
  WED_YOUNG_ADULT: {
    id: 4,
    name: '수요청년예배',
    description: '수요청년예배',
    activityCategory: '예배',
    location: '스카이아트홀',
    startTime: '21:20:00',
    endTime: '22:20:00',
  },
  FRI_YOUNG_ADULT: {
    id: 5,
    name: '금요청년예배',
    description: '금요청년예배',
    activityCategory: '예배',
    location: '스카이아트홀',
    startTime: '22:30:00',
    endTime: '23:20:00',
  },
} as const satisfies Record<string, ActivityTemplate>;

export type ActivityTemplateKey = keyof typeof ACTIVITY_TEMPLATES;
