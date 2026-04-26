import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  generatePersonalizedQuests,
  generateSharingQuest,
  todayDateString,
} from "@/lib/anthropic";
import { jsonError } from "@/lib/api-error";
import { todayRange } from "@/lib/utils";
import type { DailyState } from "@/lib/quest-types";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getOrCreateTodaySharing(date: string) {
  const existing = await supabaseAdmin
    .from("daily_sharing_quests")
    .select("*")
    .eq("date", date)
    .maybeSingle();

  if (existing.data) return existing.data;

  // Generate via AI, then UPSERT — race-safe via unique(date) + ignoreDuplicates.
  const generated = await generateSharingQuest({ date });

  const upsert = await supabaseAdmin
    .from("daily_sharing_quests")
    .upsert(
      {
        date,
        title: generated.title,
        description: generated.description,
      },
      { onConflict: "date", ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();

  if (upsert.data) return upsert.data;

  // Another request inserted first — re-read.
  const reread = await supabaseAdmin
    .from("daily_sharing_quests")
    .select("*")
    .eq("date", date)
    .single();

  if (reread.error) throw new Error(reread.error.message);
  return reread.data;
}

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

    const { startISO, endISO } = todayRange();

    const existing = await supabaseAdmin
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .order("created_at", { ascending: true });

    if (existing.data && existing.data.length >= 3) {
      return NextResponse.json({ quests: existing.data, cached: true });
    }

    // Recent titles within last 7 days for de-dup.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await supabaseAdmin
      .from("quests")
      .select("title")
      .eq("user_id", userId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(30);

    const recentTitles = (recent.data ?? []).map((r) => r.title);
    const today = todayDateString();

    // Run sharing + personalized in parallel.
    let sharing;
    let personalized;
    try {
      [sharing, personalized] = await Promise.all([
        getOrCreateTodaySharing(today),
        generatePersonalizedQuests({
          nickname: user.data.nickname,
          lifeStage: user.data.life_stage ?? null,
          dailyState: (user.data.daily_state ?? null) as DailyState | null,
          interests: Array.isArray(user.data.interests)
            ? user.data.interests
            : [],
          questPref: user.data.quest_pref ?? null,
          recentTitles,
        }),
      ]);
    } catch (e: any) {
      console.error("[quests/generate] AI error:", e?.message ?? e);
      return NextResponse.json(
        {
          error:
            "퀘스트 생성에 실패했어요. ANTHROPIC_API_KEY가 .env.local에 잘 들어가 있는지 확인해주세요.",
        },
        { status: 502 }
      );
    }

    const rows = [
      {
        user_id: userId,
        title: sharing.title,
        description: sharing.description,
        quest_type: "sharing" as const,
      },
      ...personalized.map((q) => ({
        user_id: userId,
        title: q.title,
        description: q.description,
        quest_type: q.quest_type,
      })),
    ];

    const inserted = await supabaseAdmin
      .from("quests")
      .insert(rows)
      .select()
      .order("created_at", { ascending: true });

    if (inserted.error) return jsonError(inserted.error.message);

    return NextResponse.json({ quests: inserted.data, cached: false });
  } catch (e) {
    return jsonError(e);
  }
}
