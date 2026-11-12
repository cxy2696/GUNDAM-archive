import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

export type RailEra = {
  id: string;
  code: string;
  name: { zh: string; ja: string; en: string };
  color: string;
  machineCount: number;
  eventCount: number;
};

export function CockpitRails({
  eras,
  lang,
  dict,
  totals,
}: {
  eras: RailEra[];
  lang: Lang;
  dict: Dictionary;
  totals: { machines: number; events: number; factions: number; tags: number; pages: number };
}) {
  return (
    <>
      <aside className="mfd-rail mfd-rail--left" aria-label={dict.cockpit.tacticalRail}>
        <div className="mfd-panel">
          <div className="mfd-panel__inner">
            <div className="mfd-panel__head">
              <span>{dict.cockpit.eraIndex}</span>
              <b>{String(eras.length).padStart(2, "0")}</b>
            </div>
            <div className="mfd-era-list">
              {eras.map((era) => (
                <Link
                  key={era.id}
                  href={`/${lang}/chronology?era=${era.id}`}
                  className="mfd-era"
                  style={{ "--era": era.color } as React.CSSProperties}
                  title={`${era.code} · ${pick(era.name, lang)}`}
                >
                  <span>{era.code}</span>
                  <b>{pick(era.name, lang)}</b>
                  <em>{String(era.machineCount).padStart(2, "0")}</em>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <span className="mfd-rail__label">{dict.cockpit.tacticalRail}</span>
      </aside>

      <aside className="mfd-rail mfd-rail--right" aria-label={dict.cockpit.sensorRail}>
        <div className="mfd-panel">
          <div className="mfd-panel__inner">
            <div className="mfd-panel__head">
              <span>{dict.cockpit.sensorRail}</span>
              <b>OK</b>
            </div>
            <div className="mfd-gauge" aria-hidden>
              <svg viewBox="0 0 120 120" width="104" height="104" role="presentation">
                <defs>
                  <radialGradient id="rail-radar" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(88,255,157,0.25)" />
                    <stop offset="70%" stopColor="rgba(88,255,157,0.03)" />
                    <stop offset="100%" stopColor="rgba(88,255,157,0)" />
                  </radialGradient>
                </defs>
                <circle cx="60" cy="60" r="56" fill="url(#rail-radar)" stroke="rgba(88,255,157,0.26)" />
                <circle cx="60" cy="60" r="38" fill="none" stroke="rgba(88,255,157,0.2)" strokeDasharray="2 5" />
                <circle cx="60" cy="60" r="20" fill="none" stroke="rgba(88,255,157,0.2)" strokeDasharray="2 5" />
                <path d="M60 4 L60 116 M4 60 L116 60" stroke="rgba(88,255,157,0.14)" />
                <path d="M60 60 L60 8 A52 52 0 0 1 104 34 Z" fill="rgba(88,255,157,0.16)" />
                <circle cx="82" cy="42" r="2.6" fill="#b4ff6a" />
                <circle cx="38" cy="70" r="2.2" fill="#d8ff63" />
                <circle cx="72" cy="86" r="2.2" fill="#58ff9d" />
                <circle cx="60" cy="60" r="3.2" fill="#58ff9d" />
              </svg>
            </div>
            <div className="mfd-readout">
              <span>MS</span>
              <b>{String(totals.machines).padStart(3, "0")}</b>
              <span>EVENT</span>
              <b>{String(totals.events).padStart(2, "0")}</b>
              <span>FACTION</span>
              <b>{String(totals.factions).padStart(2, "0")}</b>
              <span>TAG</span>
              <b>{String(totals.tags).padStart(2, "0")}</b>
              <span>PAGE</span>
              <b>{totals.pages}</b>
            </div>
          </div>
        </div>
        <div className="mfd-panel">
          <div className="mfd-panel__inner">
            <div className="mfd-panel__head">
              <span>{dict.cockpit.quickLinks}</span>
              <b>4</b>
            </div>
            <div className="mfd-links">
              <Link href={`/${lang}/map`}>
                {dict.nav.map} <span>▸</span>
              </Link>
              <Link href={`/${lang}/tech-tree`}>
                {dict.nav.techTree} <span>▸</span>
              </Link>
              <Link href={`/${lang}/glossary`}>
                {dict.nav.glossary} <span>▸</span>
              </Link>
              <Link href={`/${lang}/archive`}>
                {dict.nav.archive} <span>▸</span>
              </Link>
            </div>
          </div>
        </div>
        <span className="mfd-rail__label">{dict.cockpit.sensorRail}</span>
      </aside>
    </>
  );
}
