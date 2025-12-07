import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SABITX CORE",
  description: "Operator-grade system interface.",
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
