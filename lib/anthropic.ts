import Anthropic from "@anthropic-ai/sdk";
import {
  INTENSITY_PROMPT_MAP,
  type DailyState,
  type QuestType,
} from "./quest-types";
import type { QuestTypeCount } from "./types";

const client = new Anthropic();

const MODEL = "claude-opus-4-7";

// ────────────────────────────────────────────────────────────
// Sharing quest — one global quest per day, shared by every user
// ────────────────────────────────────────────────────────────

const SHARING_SYSTEM_PROMPT = `Questlog 전체 유저가 오늘 하루 동일하게 공유받는 공통 퀘스트(SHARING) 1개를 생성하세요.

원칙:
- 개인의 상황, 관심사, 직업과 무관하게 누구나 참여 가능해야 합니다.
- 사진으로 기록하기 좋아야 하며, 피드에 올라왔을 때 각자의 사진이 달라도 하나의 주제로 묶이는 느낌을 줘야 합니다.
- 제목은 15자 이내로 간결하게 작성하세요.
- description은 어떻게 사진으로 남기면 좋을지 1-2문장의 한국어 안내를 담습니다.
- 한국어로 따뜻하고 친근한 말투를 사용합니다.`;

const SHARING_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const },
    description: { type: "string" as const },
  },
  required: ["title", "description"],
  additionalProperties: false,
};

export interface GeneratedSharingQuest {
  title: string;
  description: string;
}

export async function generateSharingQuest(opts: {
  date: string;
}): Promise<GeneratedSharingQuest> {
  const userMessage = `오늘 날짜: ${opts.date}

오늘 하루 모든 유저가 동일하게 받을 SHARING 퀘스트 1개를 생성해주세요.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SHARING_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: SHARING_SCHEMA },
    },
    messages: [{ role: "user", content: userMessage }],
  } as any);

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  const parsed = JSON.parse(text) as GeneratedSharingQuest;
  if (!parsed.title) throw new Error("AI sharing quest 비어 있음");
  return parsed;
}

// ────────────────────────────────────────────────────────────
// Personalized quests — challenge + connection per user, per day
// ────────────────────────────────────────────────────────────

const PERSONALIZED_SYSTEM_PROMPT = `당신은 사용자의 일상에 작은 변화를 만들어주는 따뜻한 퀘스트 디자이너입니다.

원칙:
- 수행 시간 30분 이내, 사진 인증 가능한 가벼운 미션만 만듭니다.
- "산책하기"처럼 모호한 행동 대신, "평소 안 가본 골목길 걸어보기"처럼 구체적 행동을 제시합니다.
- 한국어로 따뜻하고 친근한 말투를 사용합니다.
- description은 사용자가 인증 사진을 어떻게 찍으면 좋을지 1-2문장으로 안내합니다.

퀘스트 타입 정의:
- CHALLENGE: 혼자 수행. 관심사를 활용하되 평소 루틴을 살짝 비틀기. (시도 자체가 목적)
- CONNECTION: 특정 실존 인물 대상. 공존이 아닌 직접적 상호작용(연락, 스몰톡 등)을 유도.

반드시 CHALLENGE 1개, CONNECTION 1개를 정확히 1개씩 생성합니다.`;

const PERSONALIZED_SCHEMA = {
  type: "object" as const,
  properties: {
    quests: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          quest_type: {
            type: "string" as const,
            enum: ["challenge", "connection"],
          },
          title: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["quest_type", "title", "description"],
        additionalProperties: false,
      },
    },
  },
  required: ["quests"],
  additionalProperties: false,
};

export interface GeneratedPersonalizedQuest {
  quest_type: "challenge" | "connection";
  title: string;
  description: string;
}

export async function generatePersonalizedQuests(opts: {
  nickname: string;
  lifeStage: string | null;
  dailyState: DailyState | null;
  interests: string[];
  questPref: string | null;
  recentTitles: string[];
}): Promise<GeneratedPersonalizedQuest[]> {
  const intensity = opts.dailyState
    ? INTENSITY_PROMPT_MAP[opts.dailyState]
    : "보통의 하루.";

  const recent =
    opts.recentTitles.length > 0
      ? opts.recentTitles.slice(0, 15).join(" / ")
      : "(없음)";

  const userMessage = `[User Profile]
- 닉네임: ${opts.nickname}
- 직업/상태: ${opts.lifeStage ?? "(미지정)"}
- 일상 리듬: ${opts.dailyState ?? "(미지정)"} → 강도 지침: ${intensity}
- 관심사: ${opts.interests.length ? opts.interests.join(", ") : "(미지정)"}
- 선호하는 스타일: ${opts.questPref ?? "(미지정)"}
- 최근 수행한 퀘스트(중복 금지): ${recent}

오늘 수행할 맞춤형 퀘스트 2개(CHALLENGE 1개, CONNECTION 1개)를 JSON 포맷으로 생성하세요.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: PERSONALIZED_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: PERSONALIZED_SCHEMA },
    },
    messages: [{ role: "user", content: userMessage }],
  } as any);

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  const parsed = JSON.parse(text) as { quests: GeneratedPersonalizedQuest[] };
  if (!Array.isArray(parsed.quests) || parsed.quests.length < 2) {
    throw new Error("AI가 CHALLENGE/CONNECTION 두 개를 생성하지 못했어요.");
  }

  // Ensure exactly one of each type — pick the first of each.
  const challenge = parsed.quests.find((q) => q.quest_type === "challenge");
  const connection = parsed.quests.find((q) => q.quest_type === "connection");
  if (!challenge || !connection) {
    throw new Error(
      "AI 응답에 CHALLENGE 또는 CONNECTION 타입이 누락되었어요."
    );
  }
  return [challenge, connection];
}

// ────────────────────────────────────────────────────────────
// Log analysis (now grouped by quest_type)
// ────────────────────────────────────────────────────────────

export async function analyzeUserLog(opts: {
  nickname: string;
  totalCompleted: number;
  byType: QuestTypeCount[];
  recentTitles: string[];
}): Promise<string> {
  const { nickname, totalCompleted, byType, recentTitles } = opts;

  if (totalCompleted === 0) {
    return `${nickname}님, 아직 완료한 퀘스트가 없어요. 오늘 가벼운 한 가지부터 시작해볼까요?`;
  }

  const stats = byType.map((c) => `${c.quest_type}: ${c.count}회`).join(", ");
  const recent =
    recentTitles.length > 0
      ? `\n최근 완료한 퀘스트:\n- ${recentTitles.slice(0, 8).join("\n- ")}`
      : "";

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 800,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium" },
    messages: [
      {
        role: "user",
        content: `당신은 사용자의 일상을 따뜻하게 관찰하는 라이프 코치입니다.
한국어로, 3-4 문장의 짧은 코멘트를 작성해주세요. 칭찬과 함께, 어떤 타입(challenge/connection/sharing)이 강하고 어떤 타입을 더 시도해보면 좋을지 부드럽게 제안해주세요.

사용자: ${nickname}
총 완료 퀘스트: ${totalCompleted}개
타입별 분포: ${stats}${recent}

코멘트만 응답하세요. 머리말("안녕하세요" 등)이나 마무리 인사 없이 본문만.`,
      },
    ],
  } as any);

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("")
    .trim();

  return text;
}

/** Today's date in YYYY-MM-DD (local time). */
export function todayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
