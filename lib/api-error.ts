import { NextResponse } from "next/server";

export function jsonError(e: unknown, status = 500) {
  const message =
    e instanceof Error ? e.message : typeof e === "string" ? e : "internal error";
  console.error("[api]", message);
  return NextResponse.json({ error: message }, { status });
}
