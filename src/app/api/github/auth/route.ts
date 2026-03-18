import { NextRequest, NextResponse } from "next/server";
import { getOrigin } from "@/lib/origin";
import { getConnectedRepos, kvSet, removeConnectedRepo } from "@/lib/store";
import { clearOAuthState, clearUserCookie, getSessionId, setOAuthState } from "@/lib/session";

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GITHUB_CLIENT_ID not set" }, { status: 500 });
  }

  const origin = getOrigin(req);
  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: clientId,
    scope: "repo admin:repo_hook",
    state,
    redirect_uri: `${origin}/api/github/callback`,
  });

  const response = NextResponse.redirect(new URL(`https://github.com/login/oauth/authorize?${params.toString()}`));
  setOAuthState(response, state);
  return response;
}

export async function DELETE(req: NextRequest) {
  const sid = getSessionId(req);
  if (sid) {
    await kvSet(`github_token:${sid}`, "");
    const repos = await getConnectedRepos(sid);
    for (const repo of repos) await removeConnectedRepo(repo, sid);
  }

  const response = NextResponse.json({ ok: true });
  clearUserCookie(response);
  clearOAuthState(response);
  return response;
}
