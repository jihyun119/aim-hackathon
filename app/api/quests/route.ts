import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError } from "@/lib/api-error";
import { todayRange } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const { startISO, endISO } = todayRange();

    const { data, error } = await supabaseAdmin
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startISO)
      .lt("created_at", endISO)
      .order("created_at", { ascending: true });

    if (error) return jsonError(error.message);

    const { count: totalCompleted } = await supabaseAdmin
      .from("quests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("completed", true);

    return NextResponse.json({
      quests: data ?? [],
      totalCompleted: totalCompleted ?? 0,
    });
  } catch (e) {
    return jsonError(e);
  }
}
