import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login", "/api/github/auth", "/api/github/callback", "/api/webhook", "/claim"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  const uid = req.cookies.get("gp_uid")?.value;
  if (!uid && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
