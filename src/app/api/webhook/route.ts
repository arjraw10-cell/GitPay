import { createHmac, timingSafeEqual } from "crypto";
import { getOrigin } from "@/lib/origin";
import { NextRequest, NextResponse } from "next/server";
import { processPullRequestPayload } from "@/lib/pr-processing";

export const runtime = "nodejs";

function validateSig(body: string, sig: string, secret: string): boolean {
  if (!secret) return true;
  const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
  try { return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)); }
  catch { return false; }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-hub-signature-256") ?? "";
  const event = req.headers.get("x-github-event") ?? "";
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";

  if (!validateSig(body, sig, secret)) return NextResponse.json({ error: "Bad signature" }, { status: 401 });

  let payload: Record<string, unknown>;
  try { payload = JSON.parse(body); }
  catch { return NextResponse.json({ error: "Bad JSON" }, { status: 400 }); }

  if (event !== "pull_request") return NextResponse.json({ ok: true, skipped: true });

  const action = payload.action as string;
  if (!["opened", "synchronize", "reopened"].includes(action)) return NextResponse.json({ ok: true, skipped: true });

  processPullRequestPayload(payload, getOrigin(req)).catch(console.error);
  return NextResponse.json({ ok: true });
}
