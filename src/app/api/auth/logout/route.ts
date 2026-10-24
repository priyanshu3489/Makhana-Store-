import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function POST(req: Request) {
  await clearSession();
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  return NextResponse.json({ ok: true, redirectTo: safeNext });
}
