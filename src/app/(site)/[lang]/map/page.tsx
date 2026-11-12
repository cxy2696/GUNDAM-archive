import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { OrbitalMap } from "@/components/OrbitalMap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.map.title,
    description: dict.map.lead,
    alternates: { canonical: `/${lang}/map/`, languages: { "zh-CN": "/zh/map/", "ja-JP": "/ja/map/" } },
  };
}

export default async function MapPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();

  return (
    <>
      <header className="page-head page-head--compact">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / ORBITAL</span>
            <span className="mono">12 ERAS / FACTION OVERVIEW</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.map.eyebrow}</div>
              <h1>{dict.map.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">12</span>
              <span className="micro">ERAS / SCHEMATIC</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.map.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(bundle.places.length).padStart(2, "0")}</b>
                <span>PLACES</span>
              </div>
              <div>
                <b className="mono">{String(bundle.events.filter((event) => event.placeId).length).padStart(2, "0")}</b>
                <span>LOCATED EVENTS</span>
              </div>
              <div>
                <b className="mono">{String(bundle.factions.length).padStart(2, "0")}</b>
                <span>{dict.archive.factions}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <OrbitalMap
        places={bundle.places}
        events={bundle.events}
        eras={bundle.eras}
        machines={bundle.machines}
        factions={bundle.factions}
        lang={typed}
        dict={dict}
      />
    </>
  );
}
