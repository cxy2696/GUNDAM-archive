import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { GlossaryExplorer } from "@/components/GlossaryExplorer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.glossary.title,
    description: dict.glossary.lead,
    alternates: {
      canonical: `/${lang}/glossary/`,
      languages: { "zh-CN": "/zh/glossary/", "ja-JP": "/ja/glossary/" },
    },
  };
}

export default async function GlossaryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const eras = [...bundle.eras].sort((a, b) => a.order - b.order);
  const usedTags = bundle.tags.filter((tag) => bundle.machines.some((machine) => machine.tags.includes(tag.id)));
  const reader = [
    { title: dict.glossary.reader.canon, text: dict.glossary.reader.canonText },
    { title: dict.glossary.reader.seed, text: dict.glossary.reader.seedText },
    { title: dict.glossary.reader.edge, text: dict.glossary.reader.edgeText },
    { title: dict.glossary.reader.unit, text: dict.glossary.reader.unitText },
    { title: dict.glossary.reader.source, text: dict.glossary.reader.sourceText },
    { title: dict.glossary.reader.era, text: dict.glossary.reader.eraText },
    { title: dict.glossary.reader.newtype, text: dict.glossary.reader.newtypeText },
    { title: dict.glossary.reader.coordinator, text: dict.glossary.reader.coordinatorText },
    { title: dict.glossary.reader.gundbit, text: dict.glossary.reader.gundbitText },
    { title: dict.glossary.reader.darkhistory, text: dict.glossary.reader.darkhistoryText },
    { title: dict.glossary.reader.calamitywar, text: dict.glossary.reader.calamitywarText },
    { title: dict.glossary.reader.ms, text: dict.glossary.reader.msText },
  ];

  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / GLOSSARY</span>
            <span className="mono">{String(usedTags.length).padStart(2, "0")} TAGS / {eras.length} ERAS</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.glossary.eyebrow}</div>
              <h1>{dict.glossary.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">{String(usedTags.length).padStart(2, "0")}</span>
              <span className="micro">TECH TERMS</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.glossary.lead}</p>
            <div className="page-head__stats">
              <div>
                <b className="mono">{String(usedTags.length).padStart(2, "0")}</b>
                <span>{dict.tree.allTags}</span>
              </div>
              <div>
                <b className="mono">{String(eras.length).padStart(2, "0")}</b>
                <span>{dict.home.stats.eras}</span>
              </div>
              <div>
                <b className="mono">12</b>
                <span>READER TERMS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="glossary-page container">
        <section className="glossary-section">
          <div className="section__top">
            <span className="micro">01 / {dict.glossary.erasTitle}</span>
            <span className="mono">{String(eras.length).padStart(2, "0")}</span>
          </div>
          <p className="glossary-section__lead">{dict.glossary.erasLead}</p>
          <div className="glossary-eras">
            {eras.map((era) => (
              <Link key={era.id} href={`/${typed}/timeline?era=${era.id}`} className="glossary-era" style={{ "--era": era.color } as React.CSSProperties}>
                <span className="mono">{era.code}</span>
                <b>{pick(era.name, typed)}</b>
                <span className="mono">{String(era.span.start).padStart(4, "0")} — {String(era.span.end).padStart(4, "0")}</span>
                <p>{pick(era.summary, typed)}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="glossary-section">
          <div className="section__top">
            <span className="micro">02 / {dict.glossary.techTitle}</span>
            <span className="mono">{String(usedTags.length).padStart(2, "0")}</span>
          </div>
          <p className="glossary-section__lead">{dict.glossary.techLead}</p>
          <GlossaryExplorer tags={usedTags} machines={bundle.machines} eras={bundle.eras} lang={typed} dict={dict} />
        </section>

        <section className="glossary-section">
          <div className="section__top">
            <span className="micro">03 / {dict.glossary.readerTitle}</span>
            <span className="mono">12</span>
          </div>
          <p className="glossary-section__lead">{dict.glossary.readerLead}</p>
          <div className="glossary-reader">
            {reader.map((item) => (
              <div key={item.title} className="glossary-reader__item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
