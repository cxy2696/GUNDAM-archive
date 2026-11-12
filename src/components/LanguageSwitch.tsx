"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

/**
 * Language switch that keeps the current path, query string and hash.
 * It also records scroll position so the destination page can restore it
 * instead of jumping back to the top.
 */
export function LanguageSwitch({
  lang,
  dict,
  className = "",
}: {
  lang: Lang;
  dict: Dictionary;
  className?: string;
}) {
  const pathname = usePathname() || "";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const rest = path.replace(new RegExp(`^/${lang}`), "") || "";
  const [suffix, setSuffix] = useState("");

  useEffect(() => {
    setSuffix(`${window.location.search}${window.location.hash}`);
  }, [pathname]);

  const remember = (target: Lang) => {
    try {
      localStorage.setItem("gundam-lang", target);
      sessionStorage.setItem("gundam:scroll", String(window.scrollY));
    } catch {
      /* private mode */
    }
  };

  return (
    <div className={`lang-switch ${className}`} role="group" aria-label={dict.common.language}>
      {([
        { code: "zh" as const, label: "中文", short: "中", title: "中文" },
        { code: "ja" as const, label: "日本語", short: "日", title: "日本語" },
        { code: "en" as const, label: "English", short: "EN", title: "English" },
      ]).map((target) => (
        <a
          key={target.code}
          href={`${basePath}/${target.code}${rest}${suffix}`}
          className={`lang-switch__option ${lang === target.code ? "is-active" : ""}`}
          aria-current={lang === target.code ? "true" : undefined}
          aria-label={target.title}
          onClick={() => remember(target.code)}
          title={target.title}
        >
          <span className="lang-switch__full" aria-hidden>{target.label}</span>
          <span className="lang-switch__short" aria-hidden>{target.short}</span>
        </a>
      ))}
    </div>
  );
}
