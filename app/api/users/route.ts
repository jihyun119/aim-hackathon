import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError } from "@/lib/api-error";
import { DAILY_STATES, type DailyState } from "@/lib/quest-types";

export const runtime = "nodejs";

interface OnboardingPayload {
  nickname?: unknown;
  lifeStage?: unknown;
  dailyState?: unknown;
  interests?: unknown;
  questPref?: unknown;
}

function normalizeProfile(payload: OnboardingPayload) {
  const lifeStage =
    typeof payload.lifeStage === "string" && payload.lifeStage.trim()
      ? payload.lifeStage.trim()
      : null;

  let dailyState: DailyState | null = null;
  if (
    typeof payload.dailyState === "string" &&
    (DAILY_STATES as readonly string[]).includes(payload.dailyState)
  ) {
    dailyState = payload.dailyState as DailyState;
  }

  const interests = Array.isArray(payload.interests)
    ? payload.interests
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        .slice(0, 3)
    : [];

  const questPref =
    typeof payload.questPref === "string" && payload.questPref.trim()
      ? payload.questPref.trim()
      : null;

  return { lifeStage, dailyState, interests, questPref };
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as OnboardingPayload;
    const trimmed = (payload.nickname ?? "").toString().trim();

    if (!trimmed || trimmed.length > 24) {
      return NextResponse.json(
        { error: "닉네임은 1~24자여야 해요." },
        { status: 400 }
      );
    }

    const profile = normalizeProfile(payload);

    const existing = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("nickname", trimmed)
      .maybeSingle();

    if (existing.data) {
      // Update onboarding answers if any were provided this round.
      const update: Record<string, unknown> = {};
      if (profile.lifeStage !== null) update.life_stage = profile.lifeStage;
      if (profile.dailyState !== null) update.daily_state = profile.dailyState;
      if (profile.interests.length > 0) update.interests = profile.interests;
      if (profile.questPref !== null) update.quest_pref = profile.questPref;

      if (Object.keys(update).length === 0) {
        return NextResponse.json({ user: existing.data });
      }

      const updated = await supabaseAdmin
        .from("users")
        .update(update)
        .eq("id", existing.data.id)
        .select()
        .single();

      if (updated.error) return jsonError(updated.error.message);
      return NextResponse.json({ user: updated.data });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        nickname: trimmed,
        life_stage: profile.lifeStage,
        daily_state: profile.dailyState,
        interests: profile.interests,
        quest_pref: profile.questPref,
      })
      .select()
      .single();

    if (error) return jsonError(error.message);

    return NextResponse.json({ user: data });
  } catch (e) {
    return jsonError(e);
  }
}
