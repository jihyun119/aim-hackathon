export const QUEST_TYPES = ["challenge", "connection", "sharing"] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_TYPE_META: Record<
  QuestType,
  {
    label: string;
    emoji: string;
    /** Used on the quest card surface — soft tinted background. */
    theme: string;
    /** Inline chip / badge — slightly stronger contrast. */
    chip: string;
    /** Bar / chart fill (Tailwind-friendly hex). */
    barColor: string;
  }
> = {
  challenge: {
    label: "도전",
    emoji: "🔥",
    theme: "from-orange-50 to-orange-100 text-orange-900 border-orange-200",
    chip: "bg-orange-100 text-orange-800 border border-orange-200",
    barColor: "#f97316",
  },
  connection: {
    label: "연결",
    emoji: "🤝",
    theme: "from-sky-50 to-sky-100 text-sky-900 border-sky-200",
    chip: "bg-sky-100 text-sky-800 border border-sky-200",
    barColor: "#0ea5e9",
  },
  sharing: {
    label: "공유",
    emoji: "🌍",
    theme: "from-violet-50 to-violet-100 text-violet-900 border-violet-200",
    chip: "bg-violet-100 text-violet-800 border border-violet-200",
    barColor: "#8b5cf6",
  },
};

export const DAILY_STATES = [
  "monotonous",
  "busy",
  "balanced",
  "unmotivated",
] as const;
export type DailyState = (typeof DAILY_STATES)[number];

export const INTENSITY_PROMPT_MAP: Record<DailyState, string> = {
  monotonous:
    "매일 비슷한 루틴을 반복 중. '이 정도면 해볼 수 있겠다' 싶은 작은 변화. 하고 나면 오늘이 달라 보이는 것.",
  busy: "여유가 없음. 이동 중이나 일상 틈새에 끼워넣을 수 있어야 함. 추가 시간/에너지 요구 금지.",
  balanced:
    "일상이 안정적. 약간의 도전이나 새로운 경험도 무리 없이 받아들일 수 있음.",
  unmotivated:
    "동기가 낮은 상태. '이거 하나만 해도 오늘 뭔가 했다'는 느낌. 절대 부담 주면 안 됨.",
};

export const DAILY_STATE_LABEL: Record<DailyState, string> = {
  monotonous: "단조롭고 반복적",
  busy: "바쁘고 정신없음",
  balanced: "균형 잡힘",
  unmotivated: "무기력함",
};

export const LIFE_STAGES = [
  "중고등학생",
  "대학생",
  "직장인",
  "취준생",
  "프리랜서",
  "기타",
] as const;
export type LifeStage = (typeof LIFE_STAGES)[number];

export const INTEREST_OPTIONS = [
  "카페",
  "운동",
  "독서",
  "영화",
  "게임",
  "요리",
  "산책",
  "사진",
  "음악",
  "SNS",
] as const;
export type Interest = (typeof INTEREST_OPTIONS)[number];

export const QUEST_PREF_OPTIONS = [
  "익숙한 동네에서 새로운 골목 발견하기",
  "오랜만에 떠오른 친구에게 안부 한 줄 보내기",
  "오늘 본 풍경 중 가장 마음에 드는 한 장면 찍기",
  "한 번도 안 가본 카페·식당 한 곳 들러보기",
  "혼자 조용히 즐길 수 있는 작은 의식 만들기",
] as const;
export type QuestPref = (typeof QUEST_PREF_OPTIONS)[number];
