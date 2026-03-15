import { NextResponse } from "next/server";
import { resetLocalDB } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  await resetLocalDB();
  return NextResponse.json({ ok: true });
}
