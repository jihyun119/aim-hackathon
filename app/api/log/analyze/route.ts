import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { analyzeUserLog } from "@/lib/anthropic";
import { jsonError } from "@/lib/api-error";
import { CATEGORIES } from "@/lib/categories";
import type { CategoryCount, QuestCategory } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (user.error || !user.data) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const completed = await supabaseAdmin
      .from("quests")
      .select("title, category, created_at")
      .eq("user_id", userId)
      .eq("completed", true)
      .order("created_at", { ascending: false });

    const rows = completed.data ?? [];

    const counts = new Map<QuestCategory, number>();
    for (const c of CATEGORIES) counts.set(c, 0);
    for (const r of rows) {
      const cat = r.category as QuestCategory;
      counts.set(cat, (counts.get(cat) ?? 0) + 1);
    }

    const stats: CategoryCount[] = CATEGORIES.map((c) => ({
      category: c,
      count: counts.get(c) ?? 0,
    }));

    let report: string;
    try {
      report = await analyzeUserLog({
        nickname: user.data.nickname,
        totalCompleted: rows.length,
        byCategory: stats,
        recentTitles: rows.map((r) => r.title),
      });
    } catch (e: any) {
      console.error("[log/analyze] AI error:", e?.message ?? e);
      report = "분석 코멘트를 불러오지 못했어요. 잠시 뒤 다시 시도해주세요.";
    }

    return NextResponse.json({ report, stats });
  } catch (e) {
    return jsonError(e);
  }
}
