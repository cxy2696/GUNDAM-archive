import Link from "next/link";
import { pick, type Dictionary } from "@/lib/i18n";
import type { Era, Faction, Lang, Machine } from "@/lib/schema";

/** The subset of a machine record the card actually renders. */
export type MachineCardData = Pick<
  Machine,
  | "id"
  | "modelCode"
  | "name"
  | "canon"
  | "eraId"
  | "factionId"
  | "summary"
  | "specs"
  | "tags"
  | "viewer"
  | "aliases"
  | "firstAppear"
>;
import { MechGlyph } from "./MechGlyph";

export function MachineCard({
  machine,
  era,
  faction,
  lang,
  dict,
  index,
  large = false,
}: {
  machine: MachineCardData;
  era?: Era;
  faction?: Faction;
  lang: Lang;
  dict: Dictionary;
  index?: number;
  large?: boolean;
}) {
  const canonLabel = dict.canon[machine.canon];
  return (
    <Link
      href={`/${lang}/machines/${machine.id}`}
      className={`mcard ${large ? "mcard--large" : ""}`}
      style={{ "--faction": faction?.color ?? "var(--cyan)" } as React.CSSProperties}
    >
      <div className="mcard__visual">
        <div className="mcard__top">
          <span>{era?.code}</span>
          <span>{faction?.short}</span>
        </div>
        <div className="mcard__target" aria-hidden />
        <MechGlyph viewer={machine.viewer} id={machine.id} className="mcard__glyph" />
        {typeof index === "number" && (
          <div className="mcard__index mono">{String(index + 1).padStart(2, "0")}</div>
        )}
        <div className="mcard__corner" aria-hidden />
      </div>
      <div className="mcard__body">
        <div className="mcard__code">
          <span>{machine.modelCode}</span>
          <span className={`tag ${machine.canon === "mainline" ? "tag--accent" : "tag--violet"}`}>{canonLabel}</span>
        </div>
        <h3 className="mcard__name">
          {pick(machine.name, lang)}
          <em>{lang === "en" ? machine.name.ja : lang === "ja" ? machine.name.zh : machine.name.ja}</em>
        </h3>
        <p className="mcard__summary">{pick(machine.summary, lang)}</p>
        <div className="mcard__foot">
          <span>{machine.specs.heightOverall ? `${machine.specs.heightOverall.toFixed(1)} M` : "N/A"}</span>
          <span>{String(machine.tags.length).padStart(2, "0")} TAGS</span>
          <span className="mcard__arrow" aria-hidden>
            ↗
          </span>
        </div>
      </div>
    </Link>
  );
}
