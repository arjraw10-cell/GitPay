# GitPay

> Autonomous rewards for open source contributors with Gemini scoring and Solana devnet payouts

GitPay connects to your GitHub repositories, uses Gemini to score every pull request, and pays contributors in Solana devnet for hackathon demos.

## Features

- **AI Scoring** - Every PR is graded by Gemini on quality, complexity, and impact
- **Devnet Payouts** - Contributors claim devnet SOL directly to their wallet
- **Zero Config** - Install a webhook and the rest is automatic
- **Leaderboard** - Track top contributors across all your repos
- **Dashboard** - See all PRs, scores, and payout history in one place

## Local Setup

1. Create `.env.local` with:

```env
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_WEBHOOK_SECRET=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-3-flash-preview

LOCAL_DB_PATH=
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_EXPLORER_BASE=https://explorer.solana.com/tx
SOLANA_CLUSTER_PARAM=?cluster=devnet
TREASURY_ADDRESS=
TREASURY_PRIVATE_KEY=
```

2. Optionally set `LOCAL_DB_PATH` if you do not want the default `data/gitpay-local-db.json`.
3. Install dependencies with `npm install`.
4. Run the app with `npm run dev`.
5. Expose `http://localhost:3000` with `ngrok http 3000` or similar for GitHub OAuth and webhooks.
6. Set the GitHub OAuth callback URL to `https://your-public-url/api/github/callback`.

## Demo Flow

1. Sign in with GitHub.
2. Go to **Setup** and connect a repository.
3. Open a PR in that repository.
4. GitPay scores the PR with Gemini and posts a claim link.
5. The contributor claims the reward and GitPay sends a real Solana devnet transaction to their wallet.
