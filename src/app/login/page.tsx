"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";

const GitPayLogo = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="3.5" r="2" fill="#fff" />
    <circle cx="3.5" cy="14.5" r="2" fill="#fff" />
    <circle cx="14.5" cy="14.5" r="2" fill="#fff" />
    <line x1="9" y1="5.5" x2="3.5" y2="12.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9" y1="5.5" x2="14.5" y2="12.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/github/repos")
      .then((r) => r.json())
      .then((d) => { if (d.connected) router.replace("/"); })
      .catch(() => {});
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "#fafafa",
      fontFamily: "inherit",
    }}>
      {/* Left panel */}
      <div style={{
        width: "420px",
        minWidth: "420px",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        padding: "48px 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "auto" }}>
          <GitPayLogo />
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#fff", letterSpacing: "-0.01em" }}>
            GitPay
          </span>
        </div>

        <div style={{ marginBottom: "auto", paddingTop: "60px" }}>
          <p style={{ fontSize: "28px", fontWeight: 600, color: "#fff", lineHeight: 1.3, margin: "0 0 16px" }}>
            Autonomous rewards for open source contributors
          </p>
          <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.6, margin: 0 }}>
            Connect your GitHub org, GitPay watches for PRs, scores them with AI, and pays contributors in SOL automatically.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {[
            ["AI Scoring", "Every PR is scored by Gemini based on quality and impact"],
            ["Instant Payouts", "Contributors claim SOL directly to their wallet"],
            ["Zero Config", "Install a webhook, the rest is automatic"],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", marginTop: "5px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#fff", marginBottom: "2px" }}>{title}</div>
                <div style={{ fontSize: "12px", color: "#71717a" }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}>
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#000", margin: "0 0 6px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: "13px", color: "#71717a", margin: "0 0 32px" }}>
            Sign in with GitHub to get started. Your account is tied to your GitHub identity.
          </p>

          <a
            href="/api/github/auth"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "11px 20px",
              background: "#000",
              color: "#fff",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            <Github size={16} />
            Continue with GitHub
          </a>

          <div style={{ margin: "24px 0", borderTop: "1px solid #e4e4e7", position: "relative" }}>
            <span style={{
              position: "absolute", top: "-9px", left: "50%", transform: "translateX(-50%)",
              background: "#fafafa", padding: "0 10px",
              fontSize: "11px", color: "#a1a1aa",
            }}>
              already have an account?
            </span>
          </div>

          <a
            href="/api/github/auth"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 20px",
              background: "#fff",
              color: "#000",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              boxSizing: "border-box",
              border: "1px solid #e4e4e7",
            }}
          >
            <Github size={16} />
            Sign in with GitHub
          </a>

          <p style={{ fontSize: "12px", color: "#a1a1aa", marginTop: "24px", lineHeight: 1.6, textAlign: "center" }}>
            By continuing, you authorize GitPay to read your repositories and install webhooks on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
