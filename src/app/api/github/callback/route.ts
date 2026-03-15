import { NextRequest, NextResponse } from "next/server";
import { getOrigin } from "@/lib/origin";
import { setUserCookie } from "@/lib/session";
import { kvSet } from "@/lib/store";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const origin = getOrigin(req);
  if (!code) return NextResponse.redirect(`${origin}/login?error=no_code`);

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const tokenData = await tokenRes.json() as { access_token?: string };
  if (!tokenData.access_token) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}`, Accept: "application/vnd.github+json" },
  });
  const userJson = userRes.ok ? await userRes.json() as { login: string } : null;
  if (!userJson?.login) {
    return NextResponse.redirect(`${origin}/login?error=github_user_failed`);
  }

  const userId = userJson.login;
  await kvSet(`github_token:${userId}`, tokenData.access_token);

  const redirect = NextResponse.redirect(`${origin}/setup`);
  setUserCookie(redirect, userId);
  return redirect;
}
