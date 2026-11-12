import type { Metadata } from "next";
import Link from "next/link";
import { RelationGraph } from "@/components/graph/RelationGraph";
import { buildEventGraph } from "@/lib/graph";
import { notFound } from "next/navigation";
import { getBundle, getEvent, getEra, getFaction, getMachine, getPlace, getCharacter } from "@/lib/content";
import { getDict, isLang, languageAlternates, pick, pickList, sourceLabel } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import type { Lang } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBundle().events.map((event) => ({ slug: event.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: pick(event.title, lang),
    description: pick(event.summary, lang),
    alternates: {
      canonical: `/${lang}/events/${event.id}/`,
      languages: languageAlternates(`/events/${event.id}`),
    },
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const event = getEvent(slug);
  if (!event) notFound();

  const era = getEra(event.eraId);
  const place = event.placeId ? getPlace(event.placeId) : null;
  const factions = event.factionIds.map((id) => getFaction(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const machines = event.machineIds.map((id) => getMachine(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const characters = event.characterIds.map((id) => getCharacter(id)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const eraEvents = bundle.events
    .filter((item) => item.eraId === event.eraId)
    .sort((a, b) => a.date.year - b.date.year || (a.date.month ?? 0) - (b.date.month ?? 0));
  const index = eraEvents.findIndex((item) => item.id === event.id);
  const previous = index > 0 ? eraEvents[index - 1] : null;
  const next = index >= 0 && index < eraEvents.length - 1 ? eraEvents[index + 1] : null;
  const graph = buildEventGraph(event.id, bundle, typed, dict);

  const scaleLabel =
    event.scale === "era" ? dict.timeline.scaleEra : event.scale === "battle" ? dict.timeline.scaleBattle : dict.timeline.scaleIncident;

  return (
    <>
      <header className="event-head">
        <div className="container">
          <div className="page-head__crumb">
            <span>
              <Link href={`/${typed}/timeline`}>{dict.timeline.title}</Link>
              <span className="crumb-sep"> / </span>
              <span className="mono">{event.id.toUpperCase()}</span>
            </span>
            <span className="mono">{era?.code} · {event.date.year}</span>
          </div>
          <div className="event-head__main">
            <div className="event-head__copy">
              <div className="eyebrow">EVENT FILE / {scaleLabel}</div>
              <h1>{pick(event.title, typed)}</h1>
              <div className="event-head__names">
                <span>{event.title.ja}</span>
                <span>{event.id}</span>
              </div>
              <p className="event-head__summary">{pick(event.summary, typed)}</p>
              <div className="tag-row">
                <span className="tag tag--accent">{era?.code}</span>
                <span className="tag">{scaleLabel}</span>
                <span className={`tag ${event.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>
                  {dict.canon[event.canon]}
                </span>
                {event.mainline && <span className="tag">{dict.timeline.mainline}</span>}
              </div>
            </div>
            <dl className="event-head__meta">
              <div>
                <dt className="micro">{dict.timeline.time}</dt>
                <dd className="mono">
                  {era ? formatStoryDate(event.date, era.code, typed) : event.date.year}
                  {event.endDate && era ? ` — ${formatStoryDate(event.endDate, era.code, typed)}` : ""}
                </dd>
              </div>
              <div>
                <dt className="micro">{dict.timeline.place}</dt>
                <dd>{place ? pick(place.name, typed) : "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.timeline.participants}</dt>
                <dd>{String(factions.length).padStart(2, "0")}</dd>
              </div>
              <div>
                <dt className="micro">{dict.timeline.relatedMachines}</dt>
                <dd>{String(machines.length).padStart(2, "0")}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="event-head__ghost" aria-hidden>{era?.code}</div>
      </header>

      <div className="event-body container">
        <article className="event-article">
          <section className="event-section">
            <div className="section__top">
              <span className="micro">01 / {dict.timeline.eventCourse}</span>
              <span className="mono">{era?.code} / EVENT RECORD</span>
            </div>
            {pickList(event.detail, typed).map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="event-paragraph">{paragraph}</p>
            ))}
          </section>

          <section className="event-section">
            <div className="section__top">
              <span className="micro">02 / {dict.timeline.outcome}</span>
            </div>
            <div className="event-outcome">
              <p>{pick(event.outcome, typed)}</p>
            </div>
          </section>

          {factions.length > 0 && (
            <section className="event-section">
              <div className="section__top">
                <span className="micro">03 / {dict.timeline.participants}</span>
                <span className="mono">{String(factions.length).padStart(2, "0")}</span>
              </div>
              <div className="event-factions">
                {factions.map((faction) => (
                  <Link key={faction.id} href={`/${typed}/factions/${faction.id}`} className="event-faction">
                    <span className="mono">{faction.short}</span>
                    <b>{pick(faction.name, typed)}</b>
                    <span aria-hidden>→</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {machines.length > 0 && (
            <section className="event-section">
              <div className="section__top">
                <span className="micro">04 / {dict.timeline.relatedMachines}</span>
                <span className="mono">{String(machines.length).padStart(2, "0")}</span>
              </div>
              <div className="event-links">
                {machines.map((machine) => (
                  <Link key={machine.id} href={`/${typed}/machines/${machine.id}`} className="event-link">
                    <span className="mono">{machine.modelCode}</span>
                    <b>{pick(machine.name, typed)}</b>
                    <span className="event-link__meta">{getEra(machine.eraId)?.code} · {machine.firstAppear.year}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {characters.length > 0 && (
            <section className="event-section">
              <div className="section__top">
                <span className="micro">05 / {dict.timeline.relatedCharacters}</span>
                <span className="mono">{String(characters.length).padStart(2, "0")}</span>
              </div>
              <div className="event-links">
                {characters.map((character) => (
                  <Link key={character.id} href={`/${typed}/characters/${character.id}`} className="event-link">
                    <span className="mono">{character.name.en}</span>
                    <b>{pick(character.name, typed)}</b>
                    <span className="event-link__meta">{pick(character.role, typed)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="event-aside">
          <div className="event-aside-card">
            <span className="micro">{dict.common.source}</span>
            {event.sources.map((source) => (
              <span key={source.label} className="event-source">
                <b>{source.level}</b> {sourceLabel(source, typed)}
              </span>
            ))}
          </div>
          <div className="event-aside-card">
            <span className="micro">{dict.timeline.otherEras}</span>
            <Link href={`/${typed}/timeline?era=${event.eraId}`} className="text-link">
              {era?.code} · {era ? pick(era.name, typed) : ""} <span aria-hidden>→</span>
            </Link>
            <Link href={`/${typed}/chronology`} className="text-link">
              {dict.chronology.title} <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="event-nav">
            {previous ? (
              <Link href={`/${typed}/events/${previous.id}`} className="event-nav__item">
                <span className="micro">PREV</span>
                <b>{pick(previous.title, typed)}</b>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/${typed}/events/${next.id}`} className="event-nav__item event-nav__item--next">
                <span className="micro">NEXT</span>
                <b>{pick(next.title, typed)}</b>
              </Link>
            ) : <span />}
          </div>
        </aside>
      </div>

      <section className="relation-section">
        <div className="container">
          {graph && <RelationGraph data={graph} dict={dict} title={`${pick(event.title, typed)} · ${dict.graph.title}`} />}
        </div>
      </section>
    </>
  );
}
