import type { Metadata, Viewport } from "next";
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/public-sans";
import "@fontsource/noto-sans-ethiopic/400.css";
import "@fontsource/noto-sans-ethiopic/600.css";
import "./globals.css";
import { APP_NAME, showDrafts } from "@/lib/config";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: `${APP_NAME}: U.S. citizenship test prep with Amharic help`,
  description:
    "Practice all 128 questions of the 2025 U.S. civics test, with Amharic explanations, real-rules practice tests and a spoken mock interview.",
  applicationName: APP_NAME,
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#1D3A6B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Shell drafts={showDrafts()}>{children}</Shell>
      </body>
    </html>
  );
}
