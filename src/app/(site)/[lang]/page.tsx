import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBundle, getMachine, getTag } from "@/lib/content";
import { getDict, isLang, languageAlternates, pick } from "@/lib/i18n";
import { dateFraction, formatStoryDate } from "@/lib/format";
import type { Lang } from "@/lib/schema";
import { EraRail } from "@/components/EraRail";
import { MachineCard } from "@/components/MachineCard";
import { MechViewer } from "@/components/viewer/MechViewer";
import { TacticalScope } from "@/components/TacticalScope";
import { QuickQuery } from "@/components/QuickQuery";
import { ArrowRightIcon, CrosshairIcon, GlobeIcon, GraphIcon } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}/`,
      languages: languageAlternates(),
    },
  };
}

const featuredIds = ["rx-78-2", "msz-006-zeta", "msn-04-sazabi", "rx-0-unicorn"];
const previewEventIds = [
  "one-year-war",
  "operation-odessa",
  "gryps-conflict",
  "axis-drop",
  "laplace-incident",
  "zanscare-war",
];

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const hero = getMachine("rx-78-2");
  if (!hero) notFound();
  const heroEra = bundle.eras.find((era) => era.id === hero.eraId);
  const heroFaction = bundle.factions.find((faction) => faction.id === hero.factionId);

  const featured = featuredIds
    .map((id) => getMachine(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  const eraCounts: Record<string, number> = {};
  for (const era of bundle.eras) {
    eraCounts[era.id] = bundle.events.filter((event) => event.eraId === era.id).length;
  }

  const lineageSpecs = [
    { from: "rx-78-2", to: "msz-006-zeta" },
    { from: "msz-006-zeta", to: "rx-93-nu" },
    { from: "rx-93-nu", to: "rx-0-unicorn" },
    { from: "rx-93-nu", to: "msn-04-sazabi" },
    { from: "lm314v21-v2", to: "turn-a" },
  ];
  const lineage = lineageSpecs
    .map((spec) => {
      const from = getMachine(spec.from);
      const to = getMachine(spec.to);
      const edge = from?.edges.find((item) => item.to === spec.to);
      if (!from || !to || !edge) return null;
      return { from, to, edge, tag: edge.techTag ? getTag(edge.techTag) : undefined };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const oneYearWar = getMachine("ms-06f-zaku-ii")?.eventIds[0] ? "one-year-war" : "one-year-war";
  const previewEvents = previewEventIds
    .map((id) => bundle.events.find((event) => event.id === id))
    .filter((event): event is NonNullable<typeof event> => Boolean(event));
  const ucWindow = bundle.eras.find((era) => era.id === "uc")?.window ?? { start: 79, end: 96 };

  const stats = [
    { value: bundle.machines.length, label: dict.home.stats.machines },
    { value: bundle.eras.length, label: dict.home.stats.eras },
    { value: bundle.events.length, label: dict.home.stats.events },
    { value: "100%", label: dict.home.stats.sourced },
  ];

  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <div className="eyebrow">{dict.home.eyebrow}</div>
            <h1 className="hero__title">
              <span>{dict.home.titleA}</span>
              <span className="hero__title-b">{dict.home.titleB}</span>
            </h1>
            <p className="hero__lead">{dict.home.lead}</p>
            <div className="hero__actions">
              <Link href={`/${typed}/machines`} className="btn">
                {dict.home.ctaExplore} <ArrowRightIcon size={15} />
              </Link>
              <Link href={`/${typed}/tech-tree`} className="btn btn--ghost">
                {dict.home.ctaTree}
              </Link>
            </div>
            <dl className="hero__stats">
              {stats.map((stat) => (
                <div key={stat.label} className="hero__stat">
                  <dt className="mono">{stat.value}</dt>
                  <dd>{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hero__stage-wrap">
            <div className="hero__scope">
              <TacticalScope code={hero.modelCode} label={pick(hero.name, typed)} />
            </div>
            <div className="hero__stage-orbit" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <div className="hero__anno hero__anno--a" aria-hidden>
              <span className="micro">SPECIMEN 01</span>
              <b className="mono">{hero.modelCode}</b>
              <i />
            </div>
            <div className="hero__anno hero__anno--b" aria-hidden>
              <span className="micro">U.C.0079 / SIDE 7</span>
              <b className="mono">LUNA TITANIUM</b>
              <i />
            </div>
            <MechViewer machine={hero} lang={typed} labels={dict.viewer} hero />
            <div className="hero__mfd-grid" aria-hidden />
            <div className="hero__mfd-specs" aria-hidden>
              <div className="hero__mfd-col">
                <span className="micro">FRAME</span>
                <b className="mono">LOD-P</b>
                <span className="micro">ARMOR</span>
                <b>{hero.specs.armor ? pick(hero.specs.armor, typed) : "N/A"}</b>
                <span className="micro">POWER</span>
                <b className="mono">{hero.specs.powerOutput ? `${hero.specs.powerOutput} kW` : "N/A"}</b>
                <span className="micro">TAGS</span>
                <b className="mono">{String(hero.tags.length).padStart(2, "0")}</b>
              </div>
              <div className="hero__mfd-col hero__mfd-col--right">
                <span className="micro">HEIGHT</span>
                <b className="mono">{hero.specs.heightOverall ? `${hero.specs.heightOverall.toFixed(1)} M` : "N/A"}</b>
                <span className="micro">WEIGHT</span>
                <b className="mono">{hero.specs.weightFull ? `${hero.specs.weightFull.toFixed(1)} T` : "N/A"}</b>
                <span className="micro">THRUST</span>
                <b className="mono">{hero.specs.thrust ? `${hero.specs.thrust} KGF` : "N/A"}</b>
                <span className="micro">SYNC</span>
                <b className="mono">99.8%</b>
              </div>
            </div>

            <div className="hero__caption">
              <span className="mono">{hero.modelCode}</span>
              <span>{pick(hero.name, typed)}</span>
              <span className="micro">{heroEra?.code} · {heroFaction?.short}</span>
            </div>
          </div>
        </div>

        <div className="container hero__rail-wrap">
          <div className="hero__rail-head">
            <span className="micro">{dict.nav.timeline}</span>
            <span className="micro">0001 — 2345 / {String(bundle.eras.length).padStart(2, "0")} ERAS</span>
          </div>
          <EraRail eras={bundle.eras} lang={typed} dict={dict} counts={eraCounts} active="uc" />
        </div>
        <div className="hero__ghost" aria-hidden>
          U.C.0079
        </div>
      </section>

      <QuickQuery
        lang={typed}
        dict={dict}
        eras={bundle.eras}
        suggestions={
          typed === "en"
            ? ["RX-78-2", "Unicorn", "Zaku", "psycoframe"]
            : typed === "ja"
              ? ["RX-78-2", "ユニコーン", "ザク", "サイコフレーム"]
              : ["RX-78-2", "独角兽", "扎古", "精神感应框架"]
        }
      />

      <section className="section" id="thesis">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">{dict.home.thesisLabel}</div>
              <h2 className="section__title">{dict.home.thesisTitle}</h2>
            </div>
            <p className="section__lead">{dict.home.thesisLead}</p>
          </div>
          <div className="pillars">
            {[
              { icon: <CrosshairIcon size={22} />, num: "01", title: dict.home.p1Title, en: dict.home.p1En, text: dict.home.p1Text },
              { icon: <GraphIcon size={22} />, num: "02", title: dict.home.p2Title, en: dict.home.p2En, text: dict.home.p2Text },
              { icon: <GlobeIcon size={22} />, num: "03", title: dict.home.p3Title, en: dict.home.p3En, text: dict.home.p3Text },
            ].map((pillar) => (
              <article key={pillar.num} className="pillar">
                <div className="pillar__top">
                  <span className="pillar__num mono">{pillar.num}</span>
                  <span className="pillar__icon">{pillar.icon}</span>
                </div>
                <h3>{pillar.title}</h3>
                <span className="pillar__en micro">{pillar.en}</span>
                <p>{pillar.text}</p>
                <span className="pillar__rule" aria-hidden />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--featured">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">{dict.home.featuredLabel}</div>
              <h2 className="section__title">{dict.home.featuredTitle}</h2>
            </div>
            <div className="section__aside">
              <p className="section__lead">{dict.home.featuredLead}</p>
              <Link href={`/${typed}/machines`} className="text-link">
                {dict.common.viewAll} <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="featured-grid">
            {featured.map((machine, index) => (
              <MachineCard
                key={machine.id}
                machine={machine}
                era={bundle.eras.find((era) => era.id === machine.eraId)}
                faction={bundle.factions.find((faction) => faction.id === machine.factionId)}
                lang={typed}
                dict={dict}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--lineage">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">{dict.home.lineageLabel}</div>
              <h2 className="section__title">{dict.home.lineageTitle}</h2>
            </div>
            <div className="section__aside">
              <p className="section__lead">{dict.home.lineageLead}</p>
              <Link href={`/${typed}/tech-tree`} className="text-link">
                {dict.nav.techTree} <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>
          <div className="lineage-table">
            <div className="lineage-head micro" aria-hidden>
              <span>FROM</span>
              <span>EDGE</span>
              <span>TO</span>
              <span>TECH TAG</span>
            </div>
            {lineage.map((row, index) => (
              <div className="lineage-row" key={`${row.from.id}-${row.to.id}`}>
                <span className="lineage-row__num mono">{String(index + 1).padStart(2, "0")}</span>
                <Link href={`/${typed}/machines/${row.from.id}`} className="lineage-node">
                  <b>{pick(row.from.name, typed)}</b>
                  <span className="mono">{row.from.modelCode} · {row.from.firstAppear.year}</span>
                </Link>
                <div className="lineage-edge">
                  <span className={`lineage-edge__kind lineage-edge__kind--${row.edge.kind}`}>
                    {dict.tree[row.edge.kind === "derive_of" ? "derive" : row.edge.kind === "replace" ? "replace" : "techFrom"]}
                  </span>
                  <span className="lineage-edge__line" aria-hidden />
                </div>
                <Link href={`/${typed}/machines/${row.to.id}`} className="lineage-node">
                  <b>{pick(row.to.name, typed)}</b>
                  <span className="mono">{row.to.modelCode} · {row.to.firstAppear.year}</span>
                </Link>
                <span className="lineage-tag">{row.tag ? pick(row.tag.name, typed) : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--timeline-preview">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">{dict.home.timelineLabel}</div>
              <h2 className="section__title">{dict.home.timelineTitle}</h2>
            </div>
            <div className="section__aside">
              <p className="section__lead">{dict.home.timelineLead}</p>
              <Link href={`/${typed}/timeline`} className="text-link">
                {dict.common.viewAll} <ArrowRightIcon size={14} />
              </Link>
            </div>
          </div>

          <div className="mini-timeline">
            <div className="mini-timeline__meta">
              <span className="mono">U.C.0079 — 0096</span>
              <span className="micro">{dict.timeline.focusWindow}</span>
            </div>
            <div className="mini-timeline__track" aria-hidden>
              {[80, 82, 84, 86, 88, 90, 92, 94, 96].map((year) => (
                <span key={year} className="mini-timeline__tick" style={{ left: `${((year - ucWindow.start) / (ucWindow.end - ucWindow.start)) * 100}%` }}>
                  <i />
                  <b className="mono">{String(year).padStart(2, "0")}</b>
                </span>
              ))}
            </div>
            {previewEvents.map((event, index) => {
              const left = ((dateFraction(event.date) - ucWindow.start) / (ucWindow.end - ucWindow.start)) * 100;
              return (
                <Link
                  key={event.id}
                  href={`/${typed}/timeline?e=${event.id}`}
                  className={`mini-event ${index % 2 === 0 ? "is-up" : "is-down"}`}
                  style={{ left: `${Math.max(1, Math.min(98, left))}%` }}
                >
                  <span className="mini-event__dot" />
                  <span className="mini-event__label">
                    <b>{pick(event.title, typed)}</b>
                    <em className="mono">{formatStoryDate(event.date, "U.C.", typed)}</em>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section--governance">
        <div className="container">
          <div className="section__head">
            <div>
              <div className="eyebrow">{dict.home.governanceLabel}</div>
              <h2 className="section__title">{dict.home.governanceTitle}</h2>
            </div>
            <p className="section__lead">{dict.home.governanceLead}</p>
          </div>
          <div className="gov">
            <div className="gov__list">
              {[
                { level: "S", label: dict.home.sourceS, desc: dict.home.sourceSDesc, color: "var(--cyan)" },
                { level: "A", label: dict.home.sourceA, desc: dict.home.sourceADesc, color: "var(--blue)" },
                { level: "B", label: dict.home.sourceB, desc: dict.home.sourceBDesc, color: "var(--amber)" },
                { level: "C", label: dict.home.sourceC, desc: dict.home.sourceCDesc, color: "var(--text-3)" },
              ].map((source) => (
                <div className="gov__row" key={source.level}>
                  <span className="gov__level mono" style={{ color: source.color }}>
                    {source.level}
                  </span>
                  <div>
                    <b>{source.label}</b>
                    <span>{source.desc}</span>
                  </div>
                  <span className="gov__bar" aria-hidden>
                    <i style={{ width: source.level === "S" ? "100%" : source.level === "A" ? "72%" : source.level === "B" ? "38%" : "12%", background: source.color }} />
                  </span>
                </div>
              ))}
              <Link href={`/${typed}/about`} className="text-link gov__link">
                {dict.home.governanceCta} <ArrowRightIcon size={14} />
              </Link>
            </div>
            <aside className="gov__quote">
              <span className="micro">EDITORIAL RULE / 04</span>
              <blockquote>
                {typed === "zh" ? (
                  <>
                    “没有参数就留空，
                    <br />
                    不用同类机体估算。”
                  </>
                ) : typed === "ja" ? (
                  <>
                    「数値がなければ空欄。
                    <br />
                    同型機からの推測はしない。」
                  </>
                ) : (
                  <>
                    “No number? Leave it blank.
                    <br />
                    Never estimate from a sister suit.”
                  </>
                )}
              </blockquote>
              <p>{dict.machine.seedNote}</p>
              <div className="gov__quote-meta mono">
                <span>DISPUTED: 01</span>
                <span>SOURCES: 24</span>
                <span>CUT: 2026.11</span>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
