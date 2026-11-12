import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildSearchIndex } from "@/lib/search-index";
import { getBundle } from "@/lib/content";
import { getDict, isLang } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollRestore } from "@/components/ScrollRestore";
import { CockpitHud } from "@/components/CockpitHud";
import { display, mono } from "@/app/fonts";
import { themeBootScript } from "@/app/theme-script";
import "@/app/globals.css";

export const dynamicParams = false;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cxy2696.github.io/GUNDAM-archive";

export function generateStaticParams() {
  return [{ lang: "zh" }, { lang: "ja" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: dict.meta.title, template: `%s · GUNDAM ARCHIVE` },
    description: dict.meta.description,
    applicationName: "GUNDAM Archive",
    authors: [{ name: "GUNDAM Archive contributors" }],
    keywords: ["Gundam", "机动战士", "高达", "モビルスーツ", "archive", "knowledge graph"],
    openGraph: {
      type: "website",
      siteName: "GUNDAM Archive",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "GUNDAM Archive" }],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${lang}/`,
      languages: {
        "zh-CN": "/zh/",
        "ja-JP": "/ja/",
        "x-default": "/zh/",
      },
    },
  };
}

export const viewport = {
  themeColor: "#060b10",
  colorScheme: "dark light" as const,
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const entries = buildSearchIndex(typed);
  const bundle = getBundle();

  return (
    <html lang={typed === "ja" ? "ja" : "zh-CN"} data-theme="dark" data-hud="on" data-read="std" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className={`${display.variable} ${mono.variable}`}>
        <div className="site" data-lang={typed}>
          <ScrollRestore />
          <div className="site-bg" aria-hidden />
          <CockpitHud dict={dict} machineCount={bundle.machines.length} eraCount={bundle.eras.length} />
          <SiteHeader lang={typed} dict={dict} />
          <main id="main" className="main">
            <div className="cockpit-deck">{children}</div>
          </main>
          <SiteFooter lang={typed} />
          <CommandPalette entries={entries} lang={typed} dict={dict} />
        </div>
      </body>
    </html>
  );
}
