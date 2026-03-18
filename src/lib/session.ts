import { NextRequest, NextResponse } from "next/server";

const COOKIE = "gp_uid";
const OAUTH_STATE_COOKIE = "gp_oauth_state";

export function getSessionId(req: NextRequest): string {
  return req.cookies.get(COOKIE)?.value || "";
}

export function setUserCookie(res: NextResponse, userId: string): void {
  res.cookies.set(COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
}

export function clearUserCookie(res: NextResponse): void {
  res.cookies.set(COOKIE, "", { maxAge: 0, path: "/" });
}

export function getOAuthState(req: NextRequest): string {
  return req.cookies.get(OAUTH_STATE_COOKIE)?.value || "";
}

export function setOAuthState(res: NextResponse, state: string): void {
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });
}

export function clearOAuthState(res: NextResponse): void {
  res.cookies.set(OAUTH_STATE_COOKIE, "", { maxAge: 0, path: "/" });
}
