import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLang, languageAlternates } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { CockpitPanel } from "@/components/cockpit/CockpitPanel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: `${dict.cockpitBay.title} · GUNDAM ARCHIVE`,
    description: dict.cockpitBay.lead,
    alternates: {
      canonical: `/${lang}/cockpit/`,
      languages: languageAlternates("/cockpit"),
    },
  };
}

export default async function CockpitPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  return (
    <div className="container cockpit-page">
      <header className="page-head">
        <div className="page-head__crumb">
          <span className="mono">GUNDAM / COCKPIT BAY</span>
          <span className="mono">1:1 / SCHEMATIC</span>
        </div>
        <div className="page-head__title-row">
          <div>
            <div className="eyebrow">{dict.cockpitBay.eyebrow}</div>
            <h1>{dict.cockpitBay.title}</h1>
          </div>
          <div className="page-head__figure" aria-hidden>
            <span className="mono">01</span>
            <span className="micro">SEAT / MFD</span>
          </div>
        </div>
      </header>
      <CockpitPanel lang={typed} dict={dict} />
    </div>
  );
}
