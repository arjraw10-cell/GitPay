"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const TITLES: Record<string, { title: string; desc: string }> = {
  "/":             { title: "Overview",      desc: "PRs are reviewed automatically. Contributors get a link to claim SOL on Solana devnet." },
  "/prs":          { title: "Pull Requests", desc: "All reviewed contributions and their scores" },
  "/transactions": { title: "Transactions",  desc: "Completed on-chain payouts on Solana devnet" },
  "/setup":        { title: "Setup",         desc: "Connect your GitHub repositories to automatically review PRs and issue rewards." },
};

export default function Topbar({ action }: { action?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const meta = TITLES[pathname] ?? TITLES["/"];

  const resetDemo = async () => {
    if (!window.confirm("Reset the local demo database? This clears claims, transactions, sessions, and connected repos.")) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      router.refresh();
      if (pathname !== "/setup") window.location.href = "/setup";
    } finally {
      setResetting(false);
    }
  };

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
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {action && <div>{action}</div>}
        <button
          onClick={resetDemo}
          disabled={resetting}
          style={{
            padding: "8px 12px",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            background: resetting ? "#fef2f2" : "#fff",
            color: "#dc2626",
            fontSize: "12px",
            fontWeight: 600,
            cursor: resetting ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {resetting ? "Resetting..." : "Reset Demo"}
        </button>
      </div>
    </div>
  );
}
