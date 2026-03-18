import { NextResponse } from "next/server";
import { getAllClaims, getLeaderboard, getStats } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const [leaderboard, stats, claims] = await Promise.all([getLeaderboard(), getStats(), getAllClaims()]);
  const contributorCount = leaderboard.length;
  const pendingScore = claims.filter((claim) => !claim.claimed).reduce((sum, claim) => sum + claim.score, 0);
  return NextResponse.json({
    leaderboard,
    stats: {
      ...stats,
      contributorCount,
      pendingScore,
    },
  });
}
