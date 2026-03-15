"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, { title: string; desc: string }> = {
  "/":             { title: "Overview",      desc: "PRs are reviewed automatically. Contributors get a link to claim SOL on Solana." },
  "/prs":          { title: "Pull Requests", desc: "All reviewed contributions and their scores" },
  "/transactions": { title: "Transactions",  desc: "Completed on-chain payouts on Solana" },
  "/setup":        { title: "Setup",         desc: "Connect your GitHub repositories to automatically review PRs and issue rewards." },
};

export default function Topbar({ action }: { action?: React.ReactNode }) {
  const pathname = usePathname();
  const meta = TITLES[pathname] ?? TITLES["/"];

  return (
    <div style={{
      padding: "20px 40px 20px",
      borderBottom: "1px solid var(--border)",
      background: "#fff",
      flexShrink: 0,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
    }}>
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#000", marginBottom: "6px" }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {meta.desc}
        </p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
