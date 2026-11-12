import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, languageAlternates } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { TechTreeExplorer } from "@/components/TechTreeExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.tree.title,
    description: dict.tree.lead,
    alternates: { canonical: `/${lang}/tech-tree/`, languages: languageAlternates("/tech-tree/") },
  };
}

export default async function TechTreePage({
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
            <span className="mono">GUNDAM / LINEAGE</span>
            <span className="mono">{String(bundle.machines.reduce((n, m) => n + m.edges.length, 0)).padStart(2, "0")} EDGES</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.tree.eyebrow}</div>
              <h1>{dict.tree.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">DAG</span>
              <span className="micro">NO CYCLES</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.tree.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(bundle.machines.length).padStart(2, "0")}</b>
                <span>{dict.tree.nodes}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.machines.reduce((n, m) => n + m.edges.length, 0)).padStart(2, "0")}</b>
                <span>{dict.tree.edges}</span>
              </div>
              <div>
                <b className="mono">03</b>
                <span>EDGE KINDS</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <TechTreeExplorer
        machines={bundle.machines.map(({ id, modelCode, name, eraId, factionId, firstAppear, tags, aliases, edges }) => ({
          id,
          modelCode,
          name,
          eraId,
          factionId,
          firstAppear,
          tags,
          aliases,
          edges: edges.map(({ to, kind, techTag }) => ({ to, kind, techTag })),
        }))}
        eras={bundle.eras}
        factions={bundle.factions}
        tags={bundle.tags}
        lang={typed}
        dict={dict}
      />
    </>
  );
}
