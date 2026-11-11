import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBundle,
  getCharacter,
  getEra,
  getEvent,
  getFaction,
  getLineage,
  getMachine,
  getPlace,
  getTag,
  getWork,
} from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import {
  formatSpecValue,
  formatStoryDate,
  heightReference,
  specFields,
  type SpecField,
} from "@/lib/format";
import type { Lang } from "@/lib/schema";
import { MechViewer } from "@/components/viewer/MechViewer";
import { MachineCard } from "@/components/MachineCard";
import { ChevronDownIcon, ArrowRightIcon, ArrowUpRightIcon } from "@/components/Icons";

export const dynamicParams = false;

export function generateStaticParams() {
  return getBundle().machines.map((machine) => ({ slug: machine.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const machine = getMachine(slug);
  if (!machine) return {};
  return {
    title: `${pick(machine.name, lang)} ${machine.modelCode}`,
    description: pick(machine.summary, lang),
    alternates: {
      canonical: `/${lang}/machines/${machine.id}/`,
      languages: {
        "zh-CN": `/zh/machines/${machine.id}/`,
        "ja-JP": `/ja/machines/${machine.id}/`,
        "x-default": `/zh/machines/${machine.id}/`,
      },
    },
    openGraph: {
      title: `${pick(machine.name, lang)} ${machine.modelCode}`,
      description: pick(machine.summary, lang),
    },
  };
}

export default async function MachinePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const machine = getMachine(slug);
  if (!machine) notFound();

  const era = getEra(machine.eraId);
  const faction = getFaction(machine.factionId);
  const tags = machine.tags.map((id) => getTag(id)).filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
  const pilots = machine.pilots
    .map((pilot) => ({ ...pilot, character: getCharacter(pilot.characterId) }))
    .filter((pilot): pilot is typeof pilot & { character: NonNullable<typeof pilot.character> } => Boolean(pilot.character));
  const events = machine.eventIds
    .map((id) => getEvent(id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  const works = machine.workIds
    .map((id) => getWork(id))
    .filter((work): work is NonNullable<typeof work> => Boolean(work));
  const lineage = getLineage(machine.id);

  const index = bundle.machines.findIndex((item) => item.id === machine.id);
  const previous = bundle.machines[(index - 1 + bundle.machines.length) % bundle.machines.length];
  const next = bundle.machines[(index + 1) % bundle.machines.length];

  const maxSpec = (field: SpecField) =>
    Math.max(0, ...bundle.machines.map((item) => item.specs[field] ?? 0));

  const meta = [
    { label: dict.machine.era, value: era ? `${era.code} · ${pick(era.name, typed)}` : "—" },
    { label: dict.machine.faction, value: faction ? pick(faction.name, typed) : "—" },
    { label: dict.machine.unitType, value: dict.unitType[machine.unitType] },
    { label: dict.machine.canon, value: dict.canon[machine.canon] },
    { label: dict.machine.firstAppear, value: era ? formatStoryDate(machine.firstAppear, era.code, typed) : "—" },
  ];

  const lineageBlock = (items: typeof lineage.incoming, direction: "in" | "out") => (
    <div className="lin-col">
      <span className="micro">{direction === "in" ? dict.machine.incoming : dict.machine.outgoing}</span>
      {items.length === 0 ? (
        <span className="lin-empty">—</span>
      ) : (
        items.map(({ edge, machine: linked }) => (
          <Link key={`${edge.kind}-${linked.id}-${direction}`} href={`/${typed}/machines/${linked.id}`} className="lin-node">
            <span className={`lin-node__kind lin-node__kind--${edge.kind}`}>
              {dict.tree[edge.kind === "derive_of" ? "derive" : edge.kind === "replace" ? "replace" : "techFrom"]}
            </span>
            <b>{pick(linked.name, typed)}</b>
            <span className="mono">{linked.modelCode}</span>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <>
      <header className="dossier-head">
        <div className="container">
          <div className="page-head__crumb">
            <span>
              <Link href={`/${typed}/machines`}>{dict.machine.breadcrumb}</Link>
              <span className="crumb-sep"> / </span>
              <span className="mono">{machine.modelCode}</span>
            </span>
            <span className="mono">{era?.code} · {machine.firstAppear.year}</span>
          </div>

          <div className="dossier-head__main">
            <div className="dossier-head__copy">
              <div className="eyebrow">{machine.modelCode} / {faction?.short}</div>
              <h1>{pick(machine.name, typed)}</h1>
              <div className="dossier-head__names">
                <span className="mono">{machine.modelCode}</span>
                <span>{machine.name.ja}</span>
                <span>{machine.name.en}</span>
              </div>
              <p className="dossier-head__summary">{pick(machine.summary, typed)}</p>
              <div className="tag-row">
                <span className={`tag ${machine.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>{dict.canon[machine.canon]}</span>
                {machine.disputed && <span className="tag tag--warn">{dict.common.disputed}</span>}
                {tags.map((tag) => (
                  <span key={tag.id} className="tag">
                    {pick(tag.name, typed)}
                  </span>
                ))}
              </div>
            </div>

            <dl className="dossier-head__meta">
              {meta.map((item) => (
                <div key={item.label}>
                  <dt className="micro">{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="dossier-head__ghost" aria-hidden>
          {machine.modelCode}
        </div>
      </header>

      <div className="dossier container">
        <div className="dossier__viewer">
          <MechViewer machine={machine} lang={typed} labels={dict.viewer} />
          <p className="dossier__asset-note micro">{dict.machine.assetNote}</p>
        </div>

        <div className="dossier__panel">
          <details className="fold" open>
            <summary>
              <span className="fold__index mono">01</span>
              <span className="fold__title">{dict.machine.overview}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              <p className="fold__lead">{pick(machine.summary, typed)}</p>
              {machine.description[typed].map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="fold__paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </details>

          <details className="fold" open>
            <summary>
              <span className="fold__index mono">02</span>
              <span className="fold__title">{dict.machine.specs}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              <div className="spec-table">
                {specFields.map((field) => {
                  const value = machine.specs[field];
                  const max = maxSpec(field);
                  const width = value && max ? Math.max(3, (value / max) * 100) : 0;
                  return (
                    <div className="spec-row" key={field}>
                      <span className="spec-row__label">{dict.spec[field]}</span>
                      <span className={`spec-row__value mono ${!value ? "is-missing" : ""}`}>
                        {formatSpecValue(field, value, typed)}
                      </span>
                      <span className="spec-row__bar" aria-hidden>
                        <i style={{ width: `${width}%` }} />
                      </span>
                      <span className="spec-row__ref">
                        {field === "heightOverall" ? heightReference(value, typed) : null}
                      </span>
                    </div>
                  );
                })}
                <div className="spec-row">
                  <span className="spec-row__label">{dict.spec.armor}</span>
                  <span className="spec-row__value">{machine.specs.armor ? pick(machine.specs.armor, typed) : dict.common.noData}</span>
                  <span className="spec-row__bar" aria-hidden />
                  <span className="spec-row__ref" />
                </div>
              </div>
              <p className="fold__note">{dict.machine.seedNote}</p>
            </div>
          </details>

          <details className="fold">
            <summary>
              <span className="fold__index mono">03</span>
              <span className="fold__title">{dict.machine.armament}</span>
              <span className="fold__count mono">{String(machine.armament.length).padStart(2, "0")}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              <ul className="armament-list">
                {machine.armament.map((item) => (
                  <li key={item.name.zh}>
                    <span className={`armament-type armament-type--${item.type}`}>{dict.armamentType[item.type]}</span>
                    <span>{pick(item.name, typed)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>

          <details className="fold" open={pilots.length > 0}>
            <summary>
              <span className="fold__index mono">04</span>
              <span className="fold__title">{dict.machine.pilots}</span>
              <span className="fold__count mono">{String(pilots.length).padStart(2, "0")}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              {pilots.length === 0 ? (
                <p className="fold__note">{dict.machine.noPilots}</p>
              ) : (
                <div className="pilot-list">
                  {pilots.map(({ character, note }) => (
                    <Link key={character.id} href={`/${typed}/characters/${character.id}`} className="pilot">
                      <span className="pilot__avatar" aria-hidden>
                        {character.name.zh.slice(0, 1)}
                      </span>
                      <span className="pilot__info">
                        <b>{pick(character.name, typed)}</b>
                        <span>{pick(character.role, typed)}</span>
                      </span>
                      <span className="pilot__link" aria-hidden>
                        <ArrowUpRightIcon size={14} />
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </details>

          <details className="fold">
            <summary>
              <span className="fold__index mono">05</span>
              <span className="fold__title">{dict.machine.lineage}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              <div className="lineage-mini">
                {lineageBlock(lineage.incoming, "in")}
                <span className="lineage-mini__arrow" aria-hidden>
                  →
                </span>
                <div className="lineage-mini__current">
                  <span className="micro">CURRENT</span>
                  <b>{pick(machine.name, typed)}</b>
                  <span className="mono">{machine.modelCode}</span>
                </div>
                <span className="lineage-mini__arrow" aria-hidden>
                  →
                </span>
                {lineageBlock(lineage.outgoing, "out")}
              </div>
              {lineage.incoming.length === 0 && lineage.outgoing.length === 0 && (
                <p className="fold__note">{dict.machine.noLineage}</p>
              )}
            </div>
          </details>

          <details className="fold">
            <summary>
              <span className="fold__index mono">06</span>
              <span className="fold__title">{dict.machine.events}</span>
              <span className="fold__count mono">{String(events.length).padStart(2, "0")}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              {events.length === 0 ? (
                <p className="fold__note">{dict.machine.noEvents}</p>
              ) : (
                <div className="event-list">
                  {events.map((event) => {
                    const eventEra = getEra(event.eraId);
                    const place = event.placeId ? getPlace(event.placeId) : undefined;
                    return (
                      <Link key={event.id} href={`/${typed}/timeline?e=${event.id}`} className="event-row">
                        <span className="event-row__date mono">
                          {eventEra ? formatStoryDate(event.date, eventEra.code, typed) : ""}
                        </span>
                        <span className="event-row__title">{pick(event.title, typed)}</span>
                        <span className="event-row__place">{place ? pick(place.name, typed) : "—"}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </details>

          <details className="fold">
            <summary>
              <span className="fold__index mono">07</span>
              <span className="fold__title">{dict.machine.sources}</span>
              <span className="fold__count mono">{String(machine.sources.length).padStart(2, "0")}</span>
              <ChevronDownIcon size={15} />
            </summary>
            <div className="fold__body">
              <ul className="source-list">
                {machine.sources.map((source) => (
                  <li key={source.label}>
                    <span className={`source-level source-level--${source.level}`}>{source.level}</span>
                    <span className="source-list__label">
                      {source.url ? (
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label} <ArrowUpRightIcon size={11} />
                        </a>
                      ) : (
                        source.label
                      )}
                      {source.note && <em>{source.note}</em>}
                    </span>
                    <span className="source-list__kind">{dict.sourceLevel[source.level]}</span>
                  </li>
                ))}
              </ul>
              <div className="status-row">
                <span className={`tag ${machine.dataQuality === "seed" ? "tag--warn" : "tag--accent"}`}>
                  {machine.dataQuality === "seed" ? dict.common.seed : dict.common.verified}
                </span>
                {machine.disputed && <span className="tag tag--warn">{dict.common.disputed}</span>}
                <span className="micro">{dict.common.updated} {machine.updatedAt}</span>
              </div>
              <p className="fold__note">{dict.machine.seedNote}</p>
              {machine.disputed && <p className="fold__note fold__note--warn">{dict.machine.disputedNote}</p>}
              <div className="works-row">
                <span className="micro">{dict.machine.works}</span>
                {works.map((work) => (
                  <span key={work.id} className="tag">
                    {pick(work.title, typed)} · {work.year}
                  </span>
                ))}
              </div>
            </div>
          </details>
        </div>
      </div>

      <section className="related">
        <div className="container">
          <div className="section__top">
            <span className="micro">{dict.machine.related}</span>
            <Link href={`/${typed}/machines`} className="text-link">
              {dict.common.viewAll} <ArrowRightIcon size={14} />
            </Link>
          </div>
          <div className="related__grid">
            {[previous, next].map((item) => (
              <MachineCard
                key={item.id}
                machine={item}
                era={getEra(item.eraId)}
                faction={getFaction(item.factionId)}
                lang={typed}
                dict={dict}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
