import type { QuestCategory } from "./types";

export const CATEGORIES: QuestCategory[] = [
  "expand",
  "relation",
  "community",
  "goal",
];

export const CATEGORY_META: Record<
  QuestCategory,
  { label: string; emoji: string; tone: string; ring: string; chip: string }
> = {
  expand: {
    label: "일상 확장",
    emoji: "🌱",
    tone: "from-emerald-950/70 to-emerald-900/40 text-emerald-100 border-emerald-700/40",
    ring: "ring-emerald-400/40",
    chip: "bg-emerald-900/60 text-emerald-200 border border-emerald-700/50",
  },
  relation: {
    label: "관계 연결",
    emoji: "💗",
    tone: "from-pink-950/70 to-pink-900/40 text-pink-100 border-pink-700/40",
    ring: "ring-pink-400/40",
    chip: "bg-pink-900/60 text-pink-200 border border-pink-700/50",
  },
  community: {
    label: "커뮤니티",
    emoji: "🤝",
    tone: "from-sky-950/70 to-sky-900/40 text-sky-100 border-sky-700/40",
    ring: "ring-sky-400/40",
    chip: "bg-sky-900/60 text-sky-200 border border-sky-700/50",
  },
  goal: {
    label: "목표 달성",
    emoji: "🎯",
    tone: "from-amber-950/70 to-amber-900/40 text-amber-100 border-amber-700/40",
    ring: "ring-amber-400/40",
    chip: "bg-amber-900/60 text-amber-200 border border-amber-700/50",
  },
};
