import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { FactionEmblem, CharacterMark } from "@/components/Emblems";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.archive.title,
    description: dict.archive.lead,
    alternates: { canonical: `/${lang}/archive/`, languages: { "zh-CN": "/zh/archive/", "ja-JP": "/ja/archive/" } },
  };
}

export default async function ArchivePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const eraOrder = (id: string) => bundle.eras.find((era) => era.id === id)?.order ?? 99;
  const factions = [...bundle.factions].sort(
    (a, b) =>
      eraOrder(a.eraIds[0]) - eraOrder(b.eraIds[0]) ||
      a.name[typed].localeCompare(b.name[typed], typed === "ja" ? "ja" : "zh"),
  );
  const works = [...bundle.works].sort((a, b) => a.year - b.year);

  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / DOSSIERS</span>
            <span className="mono">FACTIONS / CHARACTERS / WORKS</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.archive.eyebrow}</div>
              <h1>{dict.archive.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">03</span>
              <span className="micro">ANCHOR TYPES</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.archive.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(bundle.factions.length).padStart(2, "0")}</b>
                <span>{dict.archive.factions}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.characters.length).padStart(2, "0")}</b>
                <span>{dict.archive.characters}</span>
              </div>
              <div>
                <b className="mono">{String(bundle.works.length).padStart(2, "0")}</b>
                <span>{dict.archive.works}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="archive-page container">
        <section id="factions" className="archive-section">
          <div className="section__top">
            <span className="micro">01 / {dict.archive.factions}</span>
            <span className="mono">{String(factions.length).padStart(2, "0")}</span>
          </div>
          <div className="faction-era-groups">
            {bundle.eras.map((era) => {
              const group = factions.filter((faction) => faction.eraIds[0] === era.id);
              if (group.length === 0) return null;
              return (
                <section key={era.id} className="faction-era-group" aria-labelledby={`faction-era-${era.id}`}>
                  <div className="faction-era-group__head">
                    <span className="mono" style={{ color: era.color }}>{era.code}</span>
                    <h2 id={`faction-era-${era.id}`}>{pick(era.name, typed)}</h2>
                    <span className="mono">{String(group.length).padStart(2, "0")} {dict.archive.factions}</span>
                  </div>
                  <div className="faction-grid">
                    {group.map((faction) => {
                      const machineCount = bundle.machines.filter((machine) => machine.factionId === faction.id).length;
                      return (
                        <Link key={faction.id} href={`/${typed}/factions/${faction.id}`} className="faction-card">
                          <div className="faction-card__top">
                            <FactionEmblem short={faction.short} color={faction.color} size={54} />
                            <span className="faction-card__era mono">{era.code}</span>
                          </div>
                          <h3>{pick(faction.name, typed)}</h3>
                          <span className="faction-card__short mono">{faction.short}</span>
                          <p>{pick(faction.description, typed)}</p>
                          <div className="faction-card__foot">
                            <span className="mono">{String(machineCount).padStart(2, "0")} MS</span>
                            <span className="mono">{faction.founded ?? "—"}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <section id="characters" className="archive-section">
          <div className="section__top">
            <span className="micro">02 / {dict.archive.characters}</span>
            <span className="mono">{String(bundle.characters.length).padStart(2, "0")}</span>
          </div>
          <div className="character-grid">
            {bundle.characters.map((character) => {
              const faction = bundle.factions.find((item) => item.id === character.factionId);
              return (
                <Link key={character.id} href={`/${typed}/characters/${character.id}`} className="character-card">
                  <CharacterMark name={character.name[typed]} color={faction?.color ?? "#22d3ee"} />
                  <div className="character-card__body">
                    <span className="mono">{faction?.short}</span>
                    <h3>{pick(character.name, typed)}</h3>
                    <p>{pick(character.role, typed)}</p>
                  </div>
                  <span className="character-card__status" data-status={character.status}>
                    {dict.archive.statuses[character.status]}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <section id="works" className="archive-section">
          <div className="section__top">
            <span className="micro">03 / {dict.archive.works}</span>
            <span className="mono">{String(works.length).padStart(2, "0")}</span>
          </div>
          <div className="works-table">
            <div className="works-head micro" aria-hidden>
              <span>YEAR</span>
              <span>TITLE</span>
              <span>MEDIA</span>
              <span>ERA</span>
              <span>CANON</span>
            </div>
            {works.map((work) => {
              const era = bundle.eras.find((item) => item.id === work.eraId);
              return (
                <div key={work.id} className="works-row">
                  <span className="mono">{work.year}</span>
                  <div className="works-row__title">
                    <b>{pick(work.title, typed)}</b>
                    <span>{work.title.en}</span>
                  </div>
                  <span className="works-row__type">{dict.media[work.type]}</span>
                  <span className="works-row__era mono" style={{ color: era?.color }}>
                    {era?.code}
                  </span>
                  <span className={`tag ${work.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>
                    {dict.canon[work.canon]}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
