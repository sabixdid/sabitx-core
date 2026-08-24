import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SABITX | Systems in Motion",
  description:
    "Operational infrastructure for command, execution, knowledge, evidence, retail, and signal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative bg-black text-white">
        <div className="sabitx-noise"></div>
        {children}
      </body>
    </html>
  );
}
