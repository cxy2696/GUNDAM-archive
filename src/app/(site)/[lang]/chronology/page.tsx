import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { ChronologyConsole } from "@/components/ChronologyConsole";

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

const pad = (value: number, length = 4) => String(value).padStart(length, "0");

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
              <b className="mono">{String(bundle.machines.length).padStart(3, "0")}</b>
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

      <ChronologyConsole
        eras={eras}
        machines={bundle.machines}
        works={bundle.works}
        events={bundle.events}
        lang={typed}
        dict={dict}
      />

      <section className="chronology-table-section" aria-labelledby="era-overview-title">
        <div className="chronology-section-head">
          <span className="micro">01 / OVERVIEW</span>
          <h2 id="era-overview-title">{dict.chronology.tableTitle}</h2>
          <p>{dict.chronology.tableLead}</p>
        </div>
        <div className="chronology-table-scroll">
          <table className="chronology-table">
            <thead>
              <tr>
                <th scope="col">{dict.chronology.colEra}</th>
                <th scope="col">{dict.chronology.colSpan}</th>
                <th scope="col">{dict.chronology.colWindow}</th>
                <th scope="col" className="is-num">{dict.chronology.colMachines}</th>
                <th scope="col" className="is-num">{dict.chronology.colWorks}</th>
                <th scope="col" className="is-num">{dict.chronology.colEvents}</th>
              </tr>
            </thead>
            <tbody>
              {eras.map((era) => {
                const machines = bundle.machines.filter((machine) => machine.eraId === era.id);
                const works = bundle.works.filter((work) => work.eraId === era.id);
                const events = bundle.events.filter((event) => event.eraId === era.id);
                return (
                  <tr key={era.id} style={{ "--era": era.color } as React.CSSProperties}>
                    <th scope="row">
                      <Link href={`/${typed}/timeline?era=${era.id}`} className="chronology-table__era">
                        <span className="mono">{era.code}</span>
                        <b>{pick(era.name, typed)}</b>
                      </Link>
                    </th>
                    <td className="mono">{pad(era.span.start)} — {pad(era.span.end)}</td>
                    <td className="mono">{pad(era.window.start)} — {pad(era.window.end)}</td>
                    <td className="is-num mono">{machines.length}</td>
                    <td className="is-num mono">{works.length}</td>
                    <td className="is-num mono">{events.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="chronology-roster" aria-labelledby="roster-title">
        <div className="chronology-section-head">
          <span className="micro">02 / FULL ROSTER</span>
          <h2 id="roster-title">{dict.chronology.rosterTitle}</h2>
          <p>{dict.chronology.rosterLead}</p>
        </div>
        <div className="roster-groups">
          {eras.map((era, index) => {
            const machines = bundle.machines
              .filter((machine) => machine.eraId === era.id)
              .sort((a, b) => a.firstAppear.year - b.firstAppear.year || a.modelCode.localeCompare(b.modelCode));
            return (
              <details key={era.id} className="roster-group" open={index === 0} style={{ "--era": era.color } as React.CSSProperties}>
                <summary>
                  <span className="mono roster-group__code">{era.code}</span>
                  <b>{pick(era.name, typed)}</b>
                  <span className="roster-group__count mono">{machines.length} {dict.chronology.rosterCount}</span>
                  <span className="roster-group__chevron" aria-hidden>＋</span>
                </summary>
                <div className="roster-table-scroll">
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th scope="col">{dict.chronology.colModel}</th>
                        <th scope="col">{dict.chronology.colName}</th>
                        <th scope="col">{dict.chronology.colYear}</th>
                        <th scope="col">{dict.chronology.colFaction}</th>
                        <th scope="col">{dict.chronology.colWork}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machines.map((machine) => {
                        const faction = bundle.factions.find((item) => item.id === machine.factionId);
                        const work = bundle.works.find((item) => item.id === machine.workIds[0]);
                        return (
                          <tr key={machine.id}>
                            <td className="mono">{machine.modelCode}</td>
                            <td>
                              <Link href={`/${typed}/machines/${machine.id}`}>
                                {pick(machine.name, typed)}
                              </Link>
                              <span className="roster-table__ja">{typed === "zh" ? machine.name.ja : machine.name.zh}</span>
                              <span className="roster-table__meta">
                                {faction?.short ?? "—"} · {work ? pick(work.title, typed) : "—"}
                              </span>
                            </td>
                            <td className="mono">{pad(machine.firstAppear.year)}</td>
                            <td>{faction?.short ?? "—"}</td>
                            <td>{work ? pick(work.title, typed) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </div>
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
