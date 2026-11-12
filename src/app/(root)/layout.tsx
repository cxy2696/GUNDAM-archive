import type { Metadata } from "next";
import { display, mono } from "@/app/fonts";
import { themeBootScript } from "@/app/theme-script";
import "@/app/globals.css";
import "@/styles/cockpit.css";
import "@/styles/atlas.css";
import "@/styles/era-demo.css";
import "@/styles/graph.css";
import "@/styles/tag-map.css";
import "@/styles/glass.css";
import "@/styles/zoom.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://cxy2696.github.io/GUNDAM-archive"),
  title: "GUNDAM Archive · Mobile Suit Dossier",
  description: "An interactive, source-traced mobile suit archive.",
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
