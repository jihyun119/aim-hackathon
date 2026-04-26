export type QuestCategory = "expand" | "relation" | "community" | "goal";

export interface User {
  id: string;
  nickname: string;
  created_at: string;
}

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  category: QuestCategory;
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
  quest: Pick<Quest, "id" | "title" | "category">;
  user: Pick<User, "id" | "nickname">;
}

export interface CategoryCount {
  category: QuestCategory;
  count: number;
}
