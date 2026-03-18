import { Octokit } from "@octokit/rest";

function getOctokit(token?: string) {
  return new Octokit({ auth: token });
}

export async function getPRDiff(owner: string, repo: string, pullNumber: number, token?: string): Promise<string> {
  try {
    const { data } = await getOctokit(token).pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
      mediaType: { format: "diff" },
    });
    return String(data).slice(0, 8000);
  } catch {
    return "";
  }
}

export async function getPRFiles(owner: string, repo: string, pullNumber: number, token?: string) {
  try {
    const { data } = await getOctokit(token).pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber,
      per_page: 30,
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
  body: string,
  token?: string
): Promise<void> {
  await getOctokit(token).issues.createComment({
    owner,
    repo,
    issue_number: pullNumber,
    body,
  });
}

export function buildClaimComment(
  username: string,
  score: number,
  reasoning: string,
  category: string,
  claimUrl: string
): string {
  void score;
  void reasoning;
  void category;
  return `Hey @${username}, thanks for your contribution!

GitPay has reviewed your pull request. You can claim your devnet SOL reward using the link below with your Solana wallet.

**[Claim your reward ->](${claimUrl})**

---

<sub>Powered by GitPay | Solana devnet</sub>`;
}
