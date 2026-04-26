import Anthropic from "@anthropic-ai/sdk";
import type { CategoryCount, QuestCategory } from "./types";

const client = new Anthropic();

const MODEL = "claude-opus-4-7";

const QUEST_SYSTEM_PROMPT = `당신은 사용자의 일상에 작은 변화를 만들어주는 따뜻한 퀘스트 디자이너입니다.

원칙:
- 절대 무겁거나, 시간/돈이 많이 드는 미션을 주지 않습니다.
- "산책하기"처럼 모호한 행동 대신, "평소 안 가본 골목길 걸어보기"처럼 구체적인 행동을 제시합니다.
- 한국어로 따뜻하고 친근한 말투를 사용합니다.
- description은 사용자가 인증 사진을 어떻게 찍으면 좋을지 짧게 안내합니다 (1-2문장).

카테고리 정의:
- expand(일상 확장): 평소와 다른 길/장소/감각에 노출되는 미션
- relation(관계 연결): 친구·가족·동료에게 작은 신호를 보내는 미션
- community(커뮤니티): 동네·공공장소·낯선 사람과의 옅은 접촉 미션
- goal(목표 달성): 작지만 분명한 자기관리 한 걸음 미션`;

export interface GeneratedQuest {
  category: QuestCategory;
  title: string;
  description: string;
}

const QUEST_SCHEMA = {
  type: "object" as const,
  properties: {
    quests: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          category: {
            type: "string" as const,
            enum: ["expand", "relation", "community", "goal"],
          },
          title: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["category", "title", "description"],
        additionalProperties: false,
      },
    },
  },
  required: ["quests"],
  additionalProperties: false,
};

export async function generateQuestsForUser(opts: {
  nickname: string;
  recentTitles?: string[];
}): Promise<GeneratedQuest[]> {
  const recent =
    opts.recentTitles && opts.recentTitles.length > 0
      ? `\n\n최근에 받은 퀘스트(중복 피하기):\n- ${opts.recentTitles.slice(0, 10).join("\n- ")}`
      : "";

  const userMessage = `사용자 닉네임: "${opts.nickname}"

오늘의 퀘스트 3개를 생성해주세요.
- 4가지 카테고리(expand, relation, community, goal) 중 서로 다른 3가지를 골라 각 1개씩 만듭니다.
- 모두 오늘 안에 가볍게 도전 가능한 난이도여야 합니다.${recent}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: QUEST_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: QUEST_SCHEMA },
    },
    messages: [{ role: "user", content: userMessage }],
  } as any);

  const text = response.content
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("");

  const parsed = JSON.parse(text) as { quests: GeneratedQuest[] };
  // Anthropic schema doesn't accept minItems/maxItems > 1; enforce here.
  if (!Array.isArray(parsed.quests) || parsed.quests.length === 0) {
    throw new Error("AI가 빈 결과를 반환했어요.");
  }
  return parsed.quests.slice(0, 3);
}

export async function analyzeUserLog(opts: {
  nickname: string;
  totalCompleted: number;
  byCategory: CategoryCount[];
  recentTitles: string[];
}): Promise<string> {
  const { nickname, totalCompleted, byCategory, recentTitles } = opts;

  if (totalCompleted === 0) {
    return `${nickname}님, 아직 완료한 퀘스트가 없어요. 오늘 가벼운 한 가지부터 시작해볼까요?`;
  }

  const stats = byCategory
    .map((c) => `${c.category}: ${c.count}회`)
    .join(", ");
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
한국어로, 3-4 문장의 짧은 코멘트를 작성해주세요. 칭찬과 함께, 어떤 카테고리가 강하고 어떤 카테고리를 더 시도해보면 좋을지 부드럽게 제안해주세요.

사용자: ${nickname}
총 완료 퀘스트: ${totalCompleted}개
카테고리별 분포: ${stats}${recent}

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
