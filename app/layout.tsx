import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SABITX | Systems in Motion",
  description:
    "Operational infrastructure for command, execution, knowledge, evidence, retail, and signal.",
  applicationName: "SABITX RUN",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/sabitx/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/sabitx/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "SABITX RUN", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#030405" };

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
