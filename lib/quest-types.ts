export const QUEST_TYPES = ["challenge", "connection", "sharing"] as const;
export type QuestType = (typeof QUEST_TYPES)[number];

export const QUEST_TYPE_META: Record<
  QuestType,
  {
    label: string;
    emoji: string;
    tone: string;
    ring: string;
    chip: string;
    barColor: string;
  }
> = {
  challenge: {
    label: "도전",
    emoji: "🔥",
    tone: "from-orange-950/70 to-orange-900/40 text-orange-100 border-orange-700/40",
    ring: "ring-orange-400/40",
    chip: "bg-orange-900/60 text-orange-200 border border-orange-700/50",
    barColor: "#f97316",
  },
  connection: {
    label: "연결",
    emoji: "🤝",
    tone: "from-sky-950/70 to-sky-900/40 text-sky-100 border-sky-700/40",
    ring: "ring-sky-400/40",
    chip: "bg-sky-900/60 text-sky-200 border border-sky-700/50",
    barColor: "#0ea5e9",
  },
  sharing: {
    label: "공유",
    emoji: "🌍",
    tone: "from-violet-950/70 to-violet-900/40 text-violet-100 border-violet-700/40",
    ring: "ring-violet-400/40",
    chip: "bg-violet-900/60 text-violet-200 border border-violet-700/50",
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
  "오래 연락 못 한 친구한테 이유 없이 먼저 연락하기",
  "평소 가던 길을 다른 길로 가보기",
  "집에서 혼자 해본 적 없는 요리 하나 도전하기",
  "오늘 하루 중 가장 오래 머문 자리 사진 찍기",
  "자주 가는 카페 사장님이나 직원한테 스몰톡 걸기",
  "오늘 오후 11시, 각자 있는 곳에서 달 사진 찍기",
] as const;
export type QuestPref = (typeof QUEST_PREF_OPTIONS)[number];
