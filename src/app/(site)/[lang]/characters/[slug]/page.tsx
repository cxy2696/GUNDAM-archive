import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle, getCharacter, getEra, getFaction, getMachine } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import { formatStoryDate } from "@/lib/format";
import type { Lang } from "@/lib/schema";
import { CharacterMark } from "@/components/Emblems";
import { MachineCard } from "@/components/MachineCard";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBundle().characters.map((character) => ({ slug: character.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const character = getCharacter(slug);
  if (!character) return {};
  return {
    title: pick(character.name, lang),
    description: pick(character.role, lang),
    alternates: {
      canonical: `/${lang}/characters/${character.id}/`,
      languages: { "zh-CN": `/zh/characters/${character.id}/`, "ja-JP": `/ja/characters/${character.id}/` },
    },
  };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const character = getCharacter(slug);
  if (!character) notFound();

  const faction = getFaction(character.factionId);
  const era = getEra(character.eraIds[0]);
  const machines = character.machineIds
    .map((id) => getMachine(id))
    .filter((machine): machine is NonNullable<typeof machine> => Boolean(machine));
  const events = character.eventIds
    .map((id) => bundle.events.find((event) => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  const works = character.appearances
    .map((id) => bundle.works.find((work) => work.id === id))
    .filter((work): work is NonNullable<typeof work> => Boolean(work));
  const relations = character.relations
    .map((relation) => ({ ...relation, target: getCharacter(relation.targetId) }))
    .filter((relation): relation is typeof relation & { target: NonNullable<typeof relation.target> } => Boolean(relation.target));

  const affiliations = [
    { faction, period: null as null | string },
    ...character.affiliations.map((affiliation) => ({
      faction: getFaction(affiliation.factionId),
      period: pick(affiliation.period, typed),
    })),
  ].filter((item): item is { faction: NonNullable<typeof faction>; period: string | null } => Boolean(item.faction));

  return (
    <>
      <header className="profile-head profile-head--character">
        <div className="container">
          <div className="page-head__crumb">
            <span>
              <Link href={`/${typed}/archive`}>{dict.archive.title}</Link>
              <span className="crumb-sep"> / </span>
              <span className="mono">{character.name.en}</span>
            </span>
            <span className="mono">{era?.code} / PERSONNEL</span>
          </div>
          <div className="profile-head__main">
            <div className="profile-head__portrait">
              <CharacterMark name={character.name[typed]} color={faction?.color ?? "#22d3ee"} />
              <span className="profile-head__status" data-status={character.status}>
                {dict.archive.statuses[character.status]}
              </span>
            </div>
            <div className="profile-head__copy">
              <div className="eyebrow">PERSONNEL FILE / {faction?.short}</div>
              <h1>{pick(character.name, typed)}</h1>
              <div className="profile-head__names">
                <span>{character.name.en}</span>
                <span>{character.name.ja}</span>
              </div>
              <p className="profile-head__role">{pick(character.role, typed)}</p>
              <div className="tag-row">
                {affiliations.map((affiliation) => (
                  <span key={affiliation.faction.id} className="tag">
                    {pick(affiliation.faction.name, typed)}
                  </span>
                ))}
              </div>
            </div>
            <dl className="profile-head__meta">
              <div>
                <dt className="micro">{dict.archive.status}</dt>
                <dd>{dict.archive.statuses[character.status]}</dd>
              </div>
              <div>
                <dt className="micro">{dict.archive.affiliation}</dt>
                <dd>{faction ? pick(faction.name, typed) : "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.machine.era}</dt>
                <dd>{era ? `${era.code} · ${pick(era.name, typed)}` : "—"}</dd>
              </div>
              <div>
                <dt className="micro">{dict.archive.piloted}</dt>
                <dd>{String(machines.length).padStart(2, "0")} MS</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="profile-head__ghost" aria-hidden>
          {character.name.en.split(" ")[0].toUpperCase()}
        </div>
      </header>

      <div className="profile container">
        <div className="profile__main">
          <section className="profile-section">
            <div className="section__top">
              <span className="micro">01 / {dict.machine.overview}</span>
            </div>
            {character.bio[typed].map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="profile-paragraph">
                {paragraph}
              </p>
            ))}
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">02 / {dict.archive.piloted}</span>
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
                    faction={getFaction(machine.factionId)}
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
              <span className="micro">03 / {dict.machine.events}</span>
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
                    <span className="event-row__place">{eventEra?.code}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="profile-section">
            <div className="section__top">
              <span className="micro">04 / {dict.archive.relations}</span>
              <span className="mono">{String(relations.length).padStart(2, "0")}</span>
            </div>
            <div className="rel-list">
              {relations.map((relation) => (
                <Link
                  key={relation.targetId}
                  href={`/${typed}/characters/${relation.target.id}`}
                  className={`rel-row rel-row--${relation.type}`}
                >
                  <span className="rel-row__type">{dict.archive.relationTypes[relation.type]}</span>
                  <span className="rel-row__name">{pick(relation.target.name, typed)}</span>
                  <span className="rel-row__short mono">{relation.target.name.en}</span>
                  <span className="rel-row__line" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="profile__aside">
          <div className="profile-aside-card">
            <span className="micro">{dict.archive.affiliation}</span>
            {affiliations.map((affiliation) => (
              <Link key={affiliation.faction.id} href={`/${typed}/factions/${affiliation.faction.id}`} className="aside-work">
                <span className="mono">{affiliation.faction.short}</span>
                <span>{pick(affiliation.faction.name, typed)}</span>
              </Link>
            ))}
            {character.affiliations.length > 0 && (
              <div className="aside-periods">
                {character.affiliations.map((affiliation) => (
                  <span key={affiliation.factionId} className="mono">
                    {pick(affiliation.period, typed)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="profile-aside-card">
            <span className="micro">{dict.archive.appearances}</span>
            {works.map((work) => (
              <div key={work.id} className="aside-work">
                <span className="mono">{work.year}</span>
                <span>{pick(work.title, typed)}</span>
              </div>
            ))}
          </div>
          <div className="profile-aside-nav">
            <Link href={`/${typed}/archive#characters`} className="text-link">
              {dict.archive.characters} <span aria-hidden>→</span>
            </Link>
            <Link href={`/${typed}/factions/${character.factionId}`} className="text-link">
              {dict.archive.factions} <span aria-hidden>→</span>
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
