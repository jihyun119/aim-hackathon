import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError } from "@/lib/api-error";
import type { FeedItem } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select(
        `
          id, quest_id, user_id, image_url, caption, created_at,
          quest:quests ( id, title, quest_type ),
          user:users ( id, nickname )
        `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return jsonError(error.message);

    const feed: FeedItem[] = (data ?? [])
      .filter((row: any) => row.quest && row.user)
      .map((row: any) => ({
        submission: {
          id: row.id,
          quest_id: row.quest_id,
          user_id: row.user_id,
          image_url: row.image_url,
          caption: row.caption,
          created_at: row.created_at,
        },
        quest: row.quest,
        user: row.user,
      }));

    return NextResponse.json({ feed });
  } catch (e) {
    return jsonError(e);
  }
}
