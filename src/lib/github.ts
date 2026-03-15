import { Octokit } from "@octokit/rest";

const g = global as typeof global & { _githubToken?: string };
function getOctokit() {
  return new Octokit({ auth: g._githubToken });
}

export async function getPRDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
  try {
    const { data } = await getOctokit().pulls.get({
      owner, repo, pull_number: pullNumber,
      mediaType: { format: "diff" },
    });
    // diff can be large — cap at 8000 chars for the scorer
    return String(data).slice(0, 8000);
  } catch {
    return "";
  }
}

export async function getPRFiles(owner: string, repo: string, pullNumber: number) {
  try {
    const { data } = await getOctokit().pulls.listFiles({
      owner, repo, pull_number: pullNumber, per_page: 30,
    });
    return data.map((f) => ({
      filename: f.filename,
      status: f.status,
      additions: f.additions,
      deletions: f.deletions,
      patch: (f.patch || "").slice(0, 500),
    }));
  } catch {
    return [];
  }
}

export async function postPRComment(
  owner: string,
  repo: string,
  pullNumber: number,
  body: string
): Promise<void> {
  await getOctokit().issues.createComment({
    owner, repo, issue_number: pullNumber, body,
  });
}

export function buildClaimComment(
  username: string,
  score: number,
  reasoning: string,
  category: string,
  claimUrl: string
): string {
  void score; void reasoning; void category;
  return `Hey @${username}, thanks for your contribution!

GitPay has reviewed your pull request. You can claim your SOL reward using the link below — just connect your Solana wallet and you're good to go.

**[Claim your reward →](${claimUrl})**

---

<sub>Powered by GitPay · Paid out on Solana</sub>`;
}
