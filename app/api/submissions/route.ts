import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { questId, userId, imageUrl, caption } = body ?? {};

    if (!questId || !userId || !imageUrl) {
      return NextResponse.json(
        { error: "questId, userId, imageUrl 필수" },
        { status: 400 }
      );
    }

    const sub = await supabaseAdmin
      .from("submissions")
      .insert({
        quest_id: questId,
        user_id: userId,
        image_url: imageUrl,
        caption: caption ?? null,
      })
      .select()
      .single();

    if (sub.error) return jsonError(sub.error.message);

    await supabaseAdmin
      .from("quests")
      .update({ completed: true })
      .eq("id", questId)
      .eq("user_id", userId);

    return NextResponse.json({ success: true, submission: sub.data });
  } catch (e) {
    return jsonError(e);
  }
}
