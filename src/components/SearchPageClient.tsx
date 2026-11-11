"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { groupResults, searchEntries, type SearchEntry } from "@/lib/search";
import { SearchIcon } from "./Icons";

const suggestions = ["RX-78-2", "ν", "Zaku", "U.C.0079", "精神感应框架", "アムロ"];

export function SearchPageClient({
  entries,
  lang,
  dict,
}: {
  entries: SearchEntry[];
  lang: Lang;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchEntries(entries, query, dict, 40), [entries, query, dict]);
  const groups = useMemo(() => groupResults(results), [results]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="search-page container">
      <div className="search-page__bar">
        <SearchIcon size={20} />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={dict.search.placeholder}
          aria-label={dict.search.placeholder}
        />
        <kbd>⌘K</kbd>
      </div>

      {!query ? (
        <div className="search-page__empty">
          <p className="micro">{dict.search.hint}</p>
          <div className="search-page__suggestions">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="search-page__empty">
          <h2>{dict.search.noResults}</h2>
          <p className="micro">{dict.search.noResultsHint}</p>
        </div>
      ) : (
        <div className="search-page__results">
          <div className="search-page__count mono">
            {String(results.length).padStart(2, "0")} {dict.search.resultCount}
          </div>
          {groups.map((group) => (
            <section key={group.type} className="search-group">
              <div className="search-group__head">
                <span className="micro">{dict.search.groups[group.type]}</span>
                <span className="mono">{String(group.items.length).padStart(2, "0")}</span>
              </div>
              {group.items.map((entry) => (
                <Link key={`${entry.type}-${entry.id}`} href={`/${lang}${entry.href}`} className="search-row">
                  <span className="search-row__type">{dict.search.groups[entry.type]}</span>
                  <span className="search-row__title">{entry.title}</span>
                  <span className="search-row__sub">{entry.subtitle}</span>
                  <span className="search-row__meta">{entry.meta}</span>
                  <span className="search-row__arrow" aria-hidden>
                    →
                  </span>
                </Link>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
