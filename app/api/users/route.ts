import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jsonError } from "@/lib/api-error";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { nickname } = await req.json();
    const trimmed = (nickname ?? "").toString().trim();

    if (!trimmed || trimmed.length > 24) {
      return NextResponse.json(
        { error: "닉네임은 1~24자여야 해요." },
        { status: 400 }
      );
    }

    const existing = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("nickname", trimmed)
      .maybeSingle();

    if (existing.data) {
      return NextResponse.json({ user: existing.data });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({ nickname: trimmed })
      .select()
      .single();

    if (error) return jsonError(error.message);

    return NextResponse.json({ user: data });
  } catch (e) {
    return jsonError(e);
  }
}
