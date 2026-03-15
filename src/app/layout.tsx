import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GitPay",
  description: "Autonomous GitHub contribution rewards with Gemini scoring and Solana devnet payouts",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
