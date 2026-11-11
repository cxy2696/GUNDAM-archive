import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.chronology.title,
    description: dict.chronology.lead,
    alternates: {
      canonical: `/${lang}/chronology/`,
      languages: { "zh-CN": "/zh/chronology/", "ja-JP": "/ja/chronology/" },
    },
  };
}

export default async function ChronologyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const eras = [...bundle.eras].sort((a, b) => a.order - b.order);

  return (
    <div className="chronology-page container">
      <header className="page-head chronology-head">
        <div className="page-head__crumb">
          <span className="mono">GUNDAM / CHRONOLOGY</span>
          <span className="mono">{String(eras.length).padStart(2, "0")} ERAS</span>
        </div>
        <div className="page-head__title-row">
          <div>
            <div className="eyebrow">{dict.chronology.eyebrow}</div>
            <h1>{dict.chronology.title}</h1>
          </div>
          <div className="page-head__figure" aria-hidden>
            <span className="mono">{String(eras.length).padStart(2, "0")}</span>
            <span className="micro">ERAS</span>
          </div>
        </div>
        <div className="page-head__row">
          <p>{dict.chronology.lead}</p>
          <div className="page-head__stats">
            <div>
              <b className="mono">{String(bundle.machines.length).padStart(2, "0")}</b>
              <span>{dict.nav.machines}</span>
            </div>
            <div>
              <b className="mono">{String(bundle.events.length).padStart(2, "0")}</b>
              <span>{dict.chronology.events}</span>
            </div>
            <div>
              <b className="mono">{String(bundle.works.length).padStart(2, "0")}</b>
              <span>{dict.chronology.works}</span>
            </div>
          </div>
        </div>
      </header>

      <section className="chronology-grid" aria-label={dict.chronology.title}>
        {eras.map((era, index) => {
          const machines = bundle.machines.filter((machine) => machine.eraId === era.id);
          const events = bundle.events.filter((event) => event.eraId === era.id);
          const works = bundle.works.filter((work) => work.eraId === era.id);
          return (
            <Link
              key={era.id}
              href={`/${typed}/timeline?era=${era.id}`}
              className="chronology-card"
              style={{ "--era": era.color } as React.CSSProperties}
            >
              <div className="chronology-card__top">
                <span className="mono chronology-card__index">{String(index + 1).padStart(2, "0")}</span>
                <span className="mono chronology-card__code">{era.code}</span>
                <span className={`tag ${era.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>
                  {dict.canon[era.canon]}
                </span>
              </div>
              <h2>{pick(era.name, typed)}</h2>
              <span className="mono chronology-card__years">
                {String(era.span.start).padStart(4, "0")} — {String(era.span.end).padStart(4, "0")}
              </span>
              <p>{pick(era.summary, typed)}</p>
              <div className="chronology-card__stats">
                <span><b>{String(machines.length).padStart(2, "0")}</b>{dict.nav.machines}</span>
                <span><b>{String(events.length).padStart(2, "0")}</b>{dict.chronology.events}</span>
                <span><b>{String(works.length).padStart(2, "0")}</b>{dict.chronology.works}</span>
                <span className="chronology-card__arrow" aria-hidden>↗</span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="chronology-note">
        <div>
          <span className="micro">{dict.chronology.coverageTitle}</span>
          <p>{dict.chronology.coverageBody}</p>
        </div>
        <div className="chronology-note__actions">
          <Link href={`/${typed}/machines`} className="btn btn--sm">{dict.chronology.machineCta} →</Link>
          <a href="https://wiki.biligame.com/gundam/%E5%85%A8%E6%9C%BA%E4%BD%93%E8%B5%84%E6%96%99" target="_blank" rel="noreferrer" className="text-btn">
            {dict.chronology.externalCta} ↗
          </a>
        </div>
      </section>
    </div>
  );
}
