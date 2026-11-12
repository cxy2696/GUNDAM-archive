import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle, getEra, getFaction } from "@/lib/content";
import { getDict, isLang, languageAlternates, pick } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import type { Lang } from "@/lib/schema";
import { CharacterMark, FactionEmblem } from "@/components/Emblems";
import { MachineCard } from "@/components/MachineCard";
import { RelationGraph } from "@/components/graph/RelationGraph";
import { buildFactionGraph } from "@/lib/graph";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBundle().factions.map((faction) => ({ slug: faction.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const faction = getFaction(slug);
  if (!faction) return {};
  return {
    title: `${pick(faction.name, lang)} ${faction.short}`,
    description: pick(faction.description, lang),
    alternates: {
      canonical: `/${lang}/factions/${faction.id}/`,
      languages: languageAlternates(`/factions/${faction.id}`),
    },
  };
}

export default async function FactionPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const faction = getFaction(slug);
  if (!faction) notFound();

  const era = getEra(faction.eraIds[0]);
  const parent = faction.parentId ? getFaction(faction.parentId) : undefined;
  const children = bundle.factions.filter((item) => item.parentId === faction.id);
  const relations = faction.relations
    .map((relation) => ({ ...relation, target: getFaction(relation.targetId) }))
    .filter((relation): relation is typeof relation & { target: NonNullable<typeof relation.target> } => Boolean(relation.target));
  const machines = bundle.machines.filter((machine) => machine.factionId === faction.id);
  const characters = bundle.characters.filter(
    (character) =>
      character.factionId === faction.id || character.affiliations.some((affiliation) => affiliation.factionId === faction.id),
  );
  const events = bundle.events
    .filter((event) => event.factionIds.includes(faction.id))
    .sort((a, b) => a.date.year - b.date.year);
  const works = bundle.works.filter((work) => work.eraId === faction.eraIds[0]);
  const graph = buildFactionGraph(faction.id, bundle, typed, dict);

  return (
    <>
      <header className="profile-head">
        <div className="container">
          <div className="page-head__crumb">
            <span>
              <Link href={`/${typed}/archive`}>{dict.archive.title}</Link>
              <span className="crumb-sep"> / </span>
              <span className="mono">{faction.short}</span>
            </span>
            <span className="mono">{era?.code} / FACTION</span>
          </div>
          <div className="profile-head__main">
            <div className="profile-head__emblem">
              <FactionEmblem short={faction.short} color={faction.color} size={112} />
            </div>
            <div className="profile-head__copy">
              <div className="eyebrow">FACTION DOSSIER / {faction.short}</div>
              <h1>{pick(faction.name, typed)}</h1>
              <div className="profile-head__names">
                <span>{faction.name.en}</span>
                <span className="mono">{faction.short}</span>
              </div>
              {faction.motto && <p className="profile-head__motto">“{pick(faction.motto, typed)}”</p>}
              <p className="profile-head__desc">{pick(faction.description, typed)}</p>
            </div>
            <dl className="profile-head__meta">
              <div>
                <dt className="micro">{dict.archive.founded}</dt>
                <dd>{faction.founded ?? "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.archive.dissolved}</dt>
                <dd>{faction.dissolved ?? "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.machine.era}</dt>
                <dd>{era ? `${era.code} · ${pick(era.name, typed)}` : "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.archive.roster}</dt>
                <dd>{String(machines.length).padStart(2, "0")} MS / {String(characters.length).padStart(2, "0")} CREW</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="profile-head__ghost" aria-hidden>
          {faction.short}
        </div>
      </header>

      <div className="profile container">
        <div className="profile__main">
          <section className="profile-section">
            <div className="section__top">
              <span className="micro">01 / {dict.archive.organization}</span>
            </div>
            <div className="org">
              {parent ? (
                <Link href={`/${typed}/factions/${parent.id}`} className="org-node org-node--parent">
                  <span className="micro">PARENT / 上级</span>
                  <b>{pick(parent.name, typed)}</b>
                  <span className="mono">{parent.short}</span>
                </Link>
              ) : (
                <div className="org-node org-node--root">
                  <span className="micro">ROOT / 独立势力</span>
                  <b>{pick(faction.name, typed)}</b>
                  <span className="mono">{faction.short}</span>
                </div>
              )}
              <div className="org-connector" aria-hidden />
              <div className="org-children">
                <span className="micro">SUB-UNITS / 下级</span>
                {children.length === 0 ? (
                  <span className="org-empty">—</span>
                ) : (
                  children.map((child) => (
                    <Link key={child.id} href={`/${typed}/factions/${child.id}`} className="org-node">
                      <b>{pick(child.name, typed)}</b>
                      <span className="mono">{child.short}</span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">02 / {dict.archive.relations}</span>
              <span className="mono">{String(relations.length).padStart(2, "0")}</span>
            </div>
            <div className="rel-list">
              {relations.length === 0 ? (
                <p className="profile-empty">—</p>
              ) : (
                relations.map((relation) => (
                  <Link
                    key={relation.targetId}
                    href={`/${typed}/factions/${relation.target.id}`}
                    className={`rel-row rel-row--${relation.type}`}
                  >
                    <span className="rel-row__type">{dict.archive.relationTypes[relation.type]}</span>
                    <span className="rel-row__name">{pick(relation.target.name, typed)}</span>
                    <span className="rel-row__short mono">{relation.target.short}</span>
                    <span className="rel-row__line" aria-hidden />
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">03 / {dict.archive.roster}</span>
              <span className="mono">{String(machines.length).padStart(2, "0")}</span>
            </div>
            {machines.length === 0 ? (
              <p className="profile-empty">—</p>
            ) : (
              <div className="profile-machines">
                {machines.map((machine, index) => (
                  <MachineCard
                    key={machine.id}
                    machine={machine}
                    era={getEra(machine.eraId)}
                    faction={faction}
                    lang={typed}
                    dict={dict}
                    index={index}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">04 / {dict.archive.members}</span>
              <span className="mono">{String(characters.length).padStart(2, "0")}</span>
            </div>
            <div className="crew">
              {characters.map((character) => (
                <Link key={character.id} href={`/${typed}/characters/${character.id}`} className="crew-row">
                  <CharacterMark name={character.name[typed]} color={faction.color} />
                  <span className="crew-row__info">
                    <b>{pick(character.name, typed)}</b>
                    <span>{pick(character.role, typed)}</span>
                  </span>
                  <span className="crew-row__status">{dict.archive.statuses[character.status]}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">05 / {dict.machine.events}</span>
              <span className="mono">{String(events.length).padStart(2, "0")}</span>
            </div>
            <div className="event-list">
              {events.map((event) => {
                const eventEra = getEra(event.eraId);
                return (
                  <Link key={event.id} href={`/${typed}/timeline?e=${event.id}`} className="event-row">
                    <span className="event-row__date mono">
                      {eventEra ? formatStoryDate(event.date, eventEra.code, typed) : ""}
                    </span>
                    <span className="event-row__title">{pick(event.title, typed)}</span>
                    <span className="event-row__place">{dict.timeline[event.scale === "era" ? "scaleEra" : event.scale === "battle" ? "scaleBattle" : "scaleIncident"]}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="profile__aside">
          <div className="profile-aside-card">
            <span className="micro">{dict.archive.ideology}</span>
            <p>{faction.motto ? pick(faction.motto, typed) : pick(faction.description, typed)}</p>
            <div className="profile-aside-card__meta">
              <span className="mono">{faction.short}</span>
              <span className="mono">{era?.code}</span>
            </div>
          </div>
          <div className="profile-aside-card">
            <span className="micro">{dict.archive.works}</span>
            {works.map((work) => (
              <div key={work.id} className="aside-work">
                <span className="mono">{work.year}</span>
                <span>{pick(work.title, typed)}</span>
              </div>
            ))}
          </div>
          <div className="profile-aside-nav">
            <Link href={`/${typed}/archive#factions`} className="text-link">
              {dict.archive.factions} <span aria-hidden>→</span>
            </Link>
            <Link href={`/${typed}/timeline?era=${faction.eraIds[0]}`} className="text-link">
              {dict.nav.timeline} <span aria-hidden>→</span>
            </Link>
          </div>
        </aside>
      </div>

      <section className="relation-section">
        <div className="container">
          {graph && <RelationGraph data={graph} dict={dict} title={`${pick(faction.name, typed)} · ${dict.graph.title}`} />}
        </div>
      </section>
    </>
  );
}
