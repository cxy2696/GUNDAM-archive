import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";
import { pick } from "@/lib/i18n";
import type { Era, Lang } from "@/lib/schema";

export function EraRail({
  eras,
  lang,
  dict,
  counts,
  active,
}: {
  eras: Era[];
  lang: Lang;
  dict: Dictionary;
  counts: Record<string, number>;
  active?: string;
}) {
  return (
    <div className="era-rail" aria-label={dict.nav.timeline}>
      {eras.map((era) => (
        <Link
          key={era.id}
          href={`/${lang}/timeline?era=${era.id}`}
          className={`era-rail__item ${active === era.id ? "is-active" : ""}`}
          style={{ "--era": era.color } as React.CSSProperties}
        >
          <span className="era-rail__top">
            <span className="era-rail__code">{era.code}</span>
            <span className="era-rail__count mono">{String(counts[era.id] ?? 0).padStart(2, "0")}</span>
          </span>
          <span className="era-rail__name">{pick(era.name, lang)}</span>
          <span className="era-rail__span mono">
            {era.span.start}—{era.span.end}
          </span>
        </Link>
      ))}
      <Link href={`/${lang}/timeline`} className="era-rail__all">
        <span className="micro">ALL ERAS</span>
        <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
