"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { groupResults, searchEntries, type SearchEntry } from "@/lib/search";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { SearchIcon } from "./Icons";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function CommandPalette({
  lang,
  dict,
}: {
  lang: Lang;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchEntries(entries, query, dict, 15), [entries, query, dict]);
  const groups = useMemo(() => groupResults(results), [results]);

  useEffect(() => {
    if (!open || entries.length > 0) return;
    let alive = true;
    setLoading(true);
    fetch(`${BASE_PATH}/search-index.${lang}.json`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("index unavailable"))))
      .then((data: SearchEntry[]) => {
        if (alive) {
          setEntries(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, entries.length, lang]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("gundam:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gundam:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }
    setQuery("");
    setActive(0);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = (entry: SearchEntry) => {
    setOpen(false);
    router.push(`/${lang}${entry.href}`);
  };

  const onInputKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => Math.min(results.length - 1, value + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) => Math.max(0, value - 1));
    }
    if (event.key === "Enter" && results[active]) {
      event.preventDefault();
      go(results[active]);
    }
  };

  let index = -1;

  return (
    <div className={`palette ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button
        type="button"
        className="palette__backdrop"
        aria-label={dict.common.close}
        onClick={() => setOpen(false)}
        tabIndex={open ? 0 : -1}
      />
      <div
        className="palette__panel"
        role="dialog"
        aria-modal="true"
        aria-label={dict.common.search}
      >
        <div className="palette__search">
          <SearchIcon size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKey}
            placeholder={dict.search.placeholder}
            aria-label={dict.common.search}
            tabIndex={open ? 0 : -1}
          />
          <kbd>ESC</kbd>
        </div>

        {!query ? (
          <div className="palette__empty">
            <p className="micro">{loading ? "LOADING INDEX…" : dict.search.hint}</p>
            <div className="palette__chips">
              {["RX-78-2", "ν", "Zaku", "U.C.0079"].map((chip) => (
                <button key={chip} type="button" onClick={() => setQuery(chip)} tabIndex={open ? 0 : -1}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="palette__empty">
            <p className="palette__noresult">{loading ? "LOADING INDEX…" : dict.search.noResults}</p>
            <p className="micro">{dict.search.noResultsHint}</p>
          </div>
        ) : (
          <div className="palette__results">
            {groups.map((group) => (
              <div key={group.type} className="palette__group">
                <div className="palette__group-label">
                  <span>{dict.search.groups[group.type]}</span>
                  <span>{String(group.items.length).padStart(2, "0")}</span>
                </div>
                {group.items.map((entry) => {
                  index += 1;
                  const current = index;
                  return (
                    <button
                      key={`${entry.type}-${entry.id}`}
                      type="button"
                      className={`palette__row ${active === current ? "is-active" : ""}`}
                      onMouseEnter={() => setActive(current)}
                      onClick={() => go(entry)}
                      tabIndex={open ? 0 : -1}
                    >
                      <span className="palette__type">{dict.search.groups[entry.type]}</span>
                      <span className="palette__title">{entry.title}</span>
                      <span className="palette__sub">{entry.subtitle}</span>
                      <span className="palette__meta">{entry.meta}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="palette__footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> {lang === "zh" ? "选择" : "選択"}
          </span>
          <span>
            <kbd>↵</kbd> {lang === "zh" ? "打开" : "開く"}
          </span>
          <span>
            <kbd>ESC</kbd> {dict.common.close}
          </span>
          {query ? (
            <Link href={`/${lang}/search?q=${encodeURIComponent(query)}`} className="palette__all">
              {lang === "zh" ? "查看全部结果" : "すべての結果"} →
            </Link>
          ) : null}
          <span className="palette__count">
            {results.length > 0 ? `${results.length} ${dict.search.resultCount}` : "GUNDAM / INDEX"}
          </span>
        </div>
      </div>
    </div>
  );
}
