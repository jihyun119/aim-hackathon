import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateQuestsForUser } from "@/lib/anthropic";
import { jsonError } from "@/lib/api-error";
import { todayRange } from "@/lib/utils";

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

    const recent = await supabaseAdmin
      .from("quests")
      .select("title")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(15);

    let generated;
    try {
      generated = await generateQuestsForUser({
        nickname: user.data.nickname,
        recentTitles: (recent.data ?? []).map((r) => r.title),
      });
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

    const rows = generated.map((q) => ({
      user_id: userId,
      title: q.title,
      description: q.description,
      category: q.category,
    }));

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
