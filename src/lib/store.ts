import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const DB_PATH = process.env.LOCAL_DB_PATH || path.join(process.cwd(), "data", "gitpay-local-db.json");

interface LocalConnectedRepo {
  repoFullName: string;
  sessionId: string;
}

interface LocalDB {
  claims: Claim[];
  transactions: Transaction[];
  kv: Record<string, string>;
  connectedRepos: LocalConnectedRepo[];
}

const DEFAULT_DB: LocalDB = {
  claims: [],
  transactions: [],
  kv: {},
  connectedRepos: [],
};

const g = global as typeof global & {
  _gitpayDbWriteQueue?: Promise<void>;
};

async function ensureDB(): Promise<void> {
  await mkdir(path.dirname(DB_PATH), { recursive: true });
  try {
    await readFile(DB_PATH, "utf8");
  } catch {
    await writeFile(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
  }
}

async function readDB(): Promise<LocalDB> {
  await ensureDB();
  const raw = await readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<LocalDB>;
  return {
    claims: parsed.claims ?? [],
    transactions: parsed.transactions ?? [],
    kv: parsed.kv ?? {},
    connectedRepos: parsed.connectedRepos ?? [],
  };
}

async function writeDB(db: LocalDB): Promise<void> {
  await ensureDB();
  await writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

async function mutateDB(mutator: (db: LocalDB) => void | Promise<void>): Promise<void> {
  const currentQueue = g._gitpayDbWriteQueue ?? Promise.resolve();
  g._gitpayDbWriteQueue = currentQueue.then(async () => {
    const db = await readDB();
    await mutator(db);
    await writeDB(db);
  });
  return g._gitpayDbWriteQueue;
}

export interface Claim {
  token: string;
  githubUsername: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  score: number;
  reasoning: string;
  category: string;
  walletAddress?: string;
  claimed: boolean;
  txHash?: string;
  explorerUrl?: string;
  createdAt: string;
}

export interface Transaction {
  txHash: string;
  explorerUrl: string;
  githubUsername: string;
  walletAddress: string;
  amountEth: string;
  score: number;
  repo: string;
  prUrl: string;
  timestamp: string;
}

export async function addClaim(claim: Claim): Promise<void> {
  await mutateDB((db) => {
    db.claims.push(claim);
  });
}

export async function getClaim(token: string): Promise<Claim | undefined> {
  const db = await readDB();
  return db.claims.find((claim) => claim.token === token);
}

export async function getClaimByPR(repo: string, prNumber: number): Promise<Claim | undefined> {
  const db = await readDB();
  return db.claims.find((claim) => claim.repo === repo && claim.prNumber === prNumber);
}

export async function markClaimed(token: string, walletAddress: string, txHash: string, explorerUrl: string): Promise<void> {
  await mutateDB((db) => {
    const claim = db.claims.find((item) => item.token === token);
    if (!claim) return;
    claim.claimed = true;
    claim.walletAddress = walletAddress;
    claim.txHash = txHash;
    claim.explorerUrl = explorerUrl;
  });
}

export async function addTransaction(tx: Transaction): Promise<void> {
  await mutateDB((db) => {
    db.transactions.push(tx);
  });
}

export async function getAllClaims(): Promise<Claim[]> {
  const db = await readDB();
  return [...db.claims].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await readDB();
  return [...db.transactions].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function getStats() {
  const all = await getAllClaims();
  return {
    total: all.length,
    claimed: all.filter((c) => c.claimed).length,
    pending: all.filter((c) => !c.claimed).length,
    avgScore: all.length ? Math.round(all.reduce((s, c) => s + c.score, 0) / all.length) : 0,
  };
}

export async function kvSet(key: string, value: string): Promise<void> {
  await mutateDB((db) => {
    db.kv[key] = value;
  });
}

export async function kvGet(key: string): Promise<string | undefined> {
  const db = await readDB();
  return db.kv[key];
}

export async function getConnectedRepos(sessionId: string): Promise<string[]> {
  const db = await readDB();
  return db.connectedRepos
    .filter((repo) => repo.sessionId === sessionId)
    .map((repo) => repo.repoFullName);
}

export async function addConnectedRepo(repoFullName: string, sessionId: string): Promise<void> {
  await mutateDB((db) => {
    const exists = db.connectedRepos.some((repo) => repo.repoFullName === repoFullName && repo.sessionId === sessionId);
    if (!exists) db.connectedRepos.push({ repoFullName, sessionId });
  });
}

export async function removeConnectedRepo(repoFullName: string, sessionId: string): Promise<void> {
  await mutateDB((db) => {
    db.connectedRepos = db.connectedRepos.filter((repo) => !(repo.repoFullName === repoFullName && repo.sessionId === sessionId));
  });
}

export async function getTokenForRepo(repoFullName: string): Promise<string | undefined> {
  const db = await readDB();
  const repo = db.connectedRepos.find((item) => item.repoFullName === repoFullName);
  if (!repo) return undefined;
  return db.kv[`github_token:${repo.sessionId}`];
}

export interface LeaderboardEntry {
  githubUsername: string;
  totalScore: number;
  totalPaidOut: number;
  walletAddress?: string;
  flagged: boolean;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const [all, txs] = await Promise.all([getAllClaims(), getAllTransactions()]);
  const map = new Map<string, LeaderboardEntry>();
  for (const claim of all) {
    const existing = map.get(claim.githubUsername);
    if (existing) {
      existing.totalScore += claim.score;
      if (claim.walletAddress) existing.walletAddress = claim.walletAddress;
    } else {
      map.set(claim.githubUsername, {
        githubUsername: claim.githubUsername,
        totalScore: claim.score,
        totalPaidOut: 0,
        walletAddress: claim.walletAddress,
        flagged: false,
      });
    }
  }
  for (const tx of txs) {
    const existing = map.get(tx.githubUsername);
    if (existing) existing.totalPaidOut += parseFloat(tx.amountEth) * 1000;
  }
  return Array.from(map.values()).sort((a, b) => b.totalScore - a.totalScore);
}

export async function getTreasuryStats() {
  return getStats();
}

export async function resetLocalDB(): Promise<void> {
  await writeDB({
    claims: [],
    transactions: [],
    kv: {},
    connectedRepos: [],
  });
}
