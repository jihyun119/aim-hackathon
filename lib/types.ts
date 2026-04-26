import type { QuestType, DailyState, LifeStage } from "./quest-types";

export type { QuestType, DailyState, LifeStage } from "./quest-types";

export interface User {
  id: string;
  nickname: string;
  life_stage: LifeStage | string | null;
  daily_state: DailyState | null;
  interests: string[];
  quest_pref: string | null;
  created_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  quest_type: QuestType;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface Submission {
  id: string;
  quest_id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
}

export interface FeedItem {
  submission: Submission;
  quest: Pick<Quest, "id" | "title" | "quest_type">;
  user: Pick<User, "id" | "nickname">;
}

export interface QuestTypeCount {
  quest_type: QuestType;
  count: number;
}
