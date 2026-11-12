import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollRestore } from "@/components/ScrollRestore";
import { CockpitHud } from "@/components/CockpitHud";
import { CockpitConsole } from "@/components/CockpitConsole";
import { CockpitRails } from "@/components/CockpitRails";
import { getMachine } from "@/lib/content";
import { formatStoryDate } from "@/lib/format";
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
  themeColor: "#03060e",
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
  const bundle = getBundle();
  const eraStats = bundle.eras.map((era) => ({
    id: era.id,
    code: era.code,
    name: era.name,
    color: era.color,
    span: era.span,
    machineCount: bundle.machines.filter((machine) => machine.eraId === era.id).length,
    eventCount: bundle.events.filter((event) => event.eraId === era.id).length,
  }));
  const totals = {
    machines: bundle.machines.length,
    events: bundle.events.length,
    factions: bundle.factions.length,
    tags: bundle.tags.length,
    pages: bundle.machines.length + bundle.characters.length + bundle.factions.length + bundle.events.length + bundle.tags.length + bundle.works.length,
  };
  const latestEvents = [...bundle.events]
    .sort((a, b) => a.date.year - b.date.year || (a.date.month ?? 0) - (b.date.month ?? 0))
    .slice(-2)
    .reverse();
  const featured = getMachine("rx-78-2") ?? bundle.machines[0];
  const latest = latestEvents[0];
  const latestEra = latest ? bundle.eras.find((item) => item.id === latest.eraId) : undefined;
  const targets = [
    latest
      ? {
          kind: "COM",
          label: pick(latest.title, typed),
          meta: latestEra ? formatStoryDate(latest.date, latestEra.code, typed) : String(latest.date.year),
          href: `/${typed}/events/${latest.id}`,
        }
      : null,
    {
      kind: "MS",
      label: pick(featured.name, typed),
      meta: featured.modelCode,
      href: `/${typed}/machines/${featured.id}`,
    },
    {
      kind: "MAP",
      label: dict.nav.map,
      meta: `${bundle.eras.length} ERAS`,
      href: `/${typed}/map`,
    },
  ].filter((item): item is { kind: string; label: string; meta: string; href: string } => Boolean(item));

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
          <CockpitRails eras={eraStats} lang={typed} dict={dict} totals={totals} />
          <main id="main" className="main">
            <div className="cockpit-deck">
              <div className="cockpit-screen">
                <span className="cockpit-screen__scanline" aria-hidden />
                <div className="cockpit-screen__inner">
                  <div className="screen-chrome" aria-hidden>
                    <span>MFD-00 / MAIN DISPLAY</span>
                    <span className="screen-chrome__mid">
                      GUNDAM ARCHIVE · {typed === "ja" ? "日本版" : "中文版"} · {bundle.eras.length} ERAS
                    </span>
                    <span className="screen-chrome__live">● LINK STABLE</span>
                  </div>
                  {children}
                  <SiteFooter lang={typed} />
                </div>
              </div>
            </div>
          </main>
          <CockpitConsole eras={eraStats} targets={targets} totals={totals} lang={typed} dict={dict} />
          <CommandPalette lang={typed} dict={dict} />
        </div>
      </body>
    </html>
  );
}
