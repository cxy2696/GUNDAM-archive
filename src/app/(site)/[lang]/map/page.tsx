import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { AtlasExplorer } from "@/components/atlas/AtlasExplorer";

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
    description: dict.atlas.lead,
    alternates: { canonical: `/${lang}/map/`, languages: { "zh-CN": "/zh/map/", "ja-JP": "/ja/map/" } },
  };
}

export default async function MapPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const nodeCount = bundle.atlas.reduce((total, era) => total + era.nodes.length, 0);

  return (
    <>
      <header className="page-head page-head--atlas">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / ORBITAL ATLAS</span>
            <span className="mono">12 ERAS / 2D + 3D</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.atlas.eyebrow}</div>
              <h1>{dict.map.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">12</span>
              <span className="micro">ERAS / SCHEMATIC</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.atlas.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(nodeCount).padStart(3, "0")}</b>
                <span>MAP NODES</span>
              </div>
              <div>
                <b className="mono">{String(bundle.factions.length).padStart(2, "0")}</b>
                <span>{dict.archive.factions}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.events.length).padStart(2, "0")}</b>
                <span>{dict.chronology.events}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <AtlasExplorer
        atlas={bundle.atlas}
        eras={bundle.eras}
        factions={bundle.factions}
        machines={bundle.machines}
        events={bundle.events}
        lang={typed}
        dict={dict}
      />
    </>
  );
}
