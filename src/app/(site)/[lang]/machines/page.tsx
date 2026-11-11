import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { MachineExplorer } from "@/components/MachineExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.machineIndex.title,
    description: dict.machineIndex.lead,
    alternates: { canonical: `/${lang}/machines/`, languages: { "zh-CN": "/zh/machines/", "ja-JP": "/ja/machines/" } },
  };
}

export default async function MachinesPage({
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
            <span className="mono">GUNDAM / INDEX</span>
            <span className="mono">MS-{String(bundle.machines.length).padStart(3, "0")}</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.machineIndex.eyebrow}</div>
              <h1>{dict.machineIndex.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">{String(bundle.machines.length).padStart(2, "0")}</span>
              <span className="micro">MOBILE SUITS</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.machineIndex.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(bundle.eras.length).padStart(2, "0")}</b>
                <span>{dict.home.stats.eras}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.factions.filter((f) => bundle.machines.some((m) => m.factionId === f.id)).length).padStart(2, "0")}</b>
                <span>{dict.machine.faction}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.tags.length).padStart(2, "0")}</b>
                <span>{dict.machine.tags}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <MachineExplorer
        machines={bundle.machines}
        eras={bundle.eras}
        factions={bundle.factions}
        tags={bundle.tags}
        lang={typed}
        dict={dict}
      />
    </>
  );
}
