"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";

const GitPayLogoBlack = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="3.5" r="2" fill="#000" />
    <circle cx="3.5" cy="14.5" r="2" fill="#000" />
    <circle cx="14.5" cy="14.5" r="2" fill="#000" />
    <line x1="9" y1="5.5" x2="3.5" y2="12.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="9" y1="5.5" x2="14.5" y2="12.5" stroke="#000" strokeWidth="1.4" strokeLinecap="round" />
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
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "inherit" }}>
      {/* Left */}
      <div style={{
        width: "50%", background: "#fff", borderRight: "1px solid #e4e4e7",
        display: "flex", flexDirection: "column", padding: "48px 56px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "64px" }}>
          <GitPayLogoBlack />
          <span style={{ fontWeight: 600, fontSize: "15px", color: "#000", letterSpacing: "-0.01em" }}>GitPay</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <p style={{ fontSize: "30px", fontWeight: 600, color: "#000", lineHeight: 1.25, margin: "0 0 20px" }}>
            Autonomous rewards for open source contributors
          </p>
          <p style={{ fontSize: "14px", color: "#71717a", lineHeight: 1.7, margin: "0 0 48px" }}>
            Connect your GitHub org, GitPay watches for PRs, scores them with AI, and pays contributors in SOL automatically.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              ["AI Scoring", "Every PR graded by Gemini on quality and impact"],
              ["Instant Payouts", "Contributors claim SOL directly to their wallet"],
              ["Zero Config", "Install a webhook and the rest is automatic"],
            ].map(([title, desc]) => (
              <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#000", marginTop: "6px", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#000", marginBottom: "2px" }}>{title}</div>
                  <div style={{ fontSize: "12px", color: "#71717a" }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right */}
      <div style={{
        width: "50%", background: "#fafafa",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "40px",
      }}>
        <div style={{ width: "100%", maxWidth: "320px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#000", margin: "0 0 8px" }}>
            Sign in to GitPay
          </h1>
          <p style={{ fontSize: "13px", color: "#71717a", margin: "0 0 32px", lineHeight: 1.6 }}>
            Use your GitHub account. If you don&apos;t have a GitPay account yet, one will be created automatically.
          </p>

          <a
            href="/api/github/auth"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              width: "100%", padding: "11px 20px", background: "#000", color: "#fff",
              borderRadius: "8px", fontSize: "14px", fontWeight: 500,
              textDecoration: "none", boxSizing: "border-box",
            }}
          >
            <Github size={16} />
            Sign in with GitHub
          </a>

          <p style={{ fontSize: "11px", color: "#a1a1aa", marginTop: "20px", lineHeight: 1.6, textAlign: "center" }}>
            By signing in you authorize GitPay to read your repositories and install webhooks.
          </p>
        </div>
      </div>
    </div>
  );
}
