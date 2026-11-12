import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, languageAlternates } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { TimelineExplorer } from "@/components/TimelineExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.timeline.title,
    description: dict.timeline.lead,
    alternates: { canonical: `/${lang}/timeline/`, languages: languageAlternates("/timeline/") },
  };
}

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();

  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / CHRONOLOGY</span>
            <span className="mono">0001 — 2345</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.timeline.eyebrow}</div>
              <h1>{dict.timeline.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">{String(bundle.eras.length).padStart(2, "0")}</span>
              <span className="micro">ERAS / LANES</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.timeline.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(bundle.events.length).padStart(2, "0")}</b>
                <span>{dict.home.stats.events}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.eras.length).padStart(2, "0")}</b>
                <span>{dict.home.stats.eras}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.places.length).padStart(2, "0")}</b>
                <span>{dict.timeline.place}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <TimelineExplorer
        eras={bundle.eras}
        events={bundle.events}
        places={bundle.places}
        machines={bundle.machines}
        characters={bundle.characters}
        factions={bundle.factions}
        lang={typed}
        dict={dict}
      />
    </>
  );
}
