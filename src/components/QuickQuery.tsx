"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { SearchIcon } from "./Icons";

export function QuickQuery({
  lang,
  dict,
  eras,
  suggestions,
}: {
  lang: Lang;
  dict: Dictionary;
  eras: { id: string; code: string; name: { zh: string; ja: string; en: string }; color: string }[];
  suggestions: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) {
      window.dispatchEvent(new Event("gundam:search"));
      return;
    }
    router.push(`/${lang}/search?q=${encodeURIComponent(value)}`);
  };

  return (
    <section className="quick-query container" aria-labelledby="quick-query-title">
      <div className="quick-query__head">
        <span className="micro" id="quick-query-title">
          QUICK QUERY / FAST FIND
        </span>
        <span className="mono">INDEX 487 · PRESS ⌘K</span>
      </div>
      <div className="quick-query__grid">
        <form className="quick-query__form" onSubmit={submit} role="search">
          <SearchIcon size={20} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.search.placeholder}
            aria-label={dict.search.placeholder}
          />
          <button type="submit" className="quick-query__go" aria-label={dict.common.search}>
            <span>{dict.common.search}</span>
            <kbd>↵</kbd>
          </button>
        </form>
        <div className="quick-query__side">
          <span className="micro">{dict.search.hint}</span>
          <div className="quick-query__chips">
            {suggestions.slice(0, 4).map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="quick-query__eras" aria-label={dict.machineIndex.allEras}>
        {eras.map((era) => (
          <Link key={era.id} href={`/${lang}/machines?era=${era.id}`} style={{ "--era": era.color } as React.CSSProperties}>
            <b>{era.code}</b>
            <span>{era.name[lang] ?? era.name.en}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
