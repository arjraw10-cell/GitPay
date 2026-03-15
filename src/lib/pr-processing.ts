import { randomUUID } from "crypto";
import { getPRDiff, getPRFiles, postPRComment, buildClaimComment } from "@/lib/github";
import { scorePR } from "@/lib/scorer";
import { addClaim, getTokenForRepo, getClaimByPR } from "@/lib/store";
import { emitEvent } from "@/lib/events";

const g = global as typeof global & { _githubToken?: string };

export async function processPullRequestPayload(payload: Record<string, unknown>, appUrl: string) {
  const pr = payload.pull_request as Record<string, unknown>;
  const repoData = payload.repository as Record<string, unknown>;
  const repoFullName = repoData.full_name as string;
  const [owner, repoName] = repoFullName.split("/");
  const prNumber = pr.number as number;
  const prUrl = pr.html_url as string;
  const prTitle = pr.title as string;
  const prBody = (pr.body as string) || "";
  const username = (pr.user as Record<string, unknown>).login as string;
  const additions = pr.additions as number;
  const deletions = pr.deletions as number;
  const changedFiles = pr.changed_files as number;

  console.log(`[pr] Processing PR #${prNumber} "${prTitle}" by @${username} in ${repoFullName}`);

  if (await getClaimByPR(repoFullName, prNumber)) {
    console.log(`[pr] PR #${prNumber} already has a claim, skipping`);
    return { skipped: true, reason: "already_exists" } as const;
  }

  const repoToken = await getTokenForRepo(repoFullName);
  g._githubToken = repoToken;
  const [diff, files] = await Promise.all([
    getPRDiff(owner, repoName, prNumber),
    getPRFiles(owner, repoName, prNumber),
  ]);

  const scored = await scorePR({ title: prTitle, body: prBody, additions, deletions, changedFiles, files, diff });
  console.log(`[pr] Scored PR #${prNumber}: ${scored.score}/100`);

  const token = randomUUID();
  const claimUrl = `${appUrl}/claim/${token}`;
  const claim = {
    token,
    githubUsername: username,
    repo: repoFullName,
    prNumber,
    prUrl,
    prTitle,
    score: scored.score,
    reasoning: scored.reasoning,
    category: scored.category,
    claimed: false,
    createdAt: new Date().toISOString(),
  };

  await addClaim(claim);

  const commentBody = buildClaimComment(username, scored.score, scored.reasoning, scored.category, claimUrl);
  try {
    await postPRComment(owner, repoName, prNumber, commentBody);
  } catch (err) {
    console.error("[pr] Failed to post comment:", err);
  }

  emitEvent("new_claim", claim);
  return { skipped: false, claim } as const;
}
