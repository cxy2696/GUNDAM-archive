import type { Metadata } from "next";
import { display, mono } from "@/app/fonts";
import { themeBootScript } from "@/app/theme-script";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cxy2696.github.io/GUNDAM-archive"),
  title: "GUNDAM Archive · 机动战士档案",
  description: "可交互、可追溯的机动战士档案馆。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="dark" data-hud="on" data-read="std" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
