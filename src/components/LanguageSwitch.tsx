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
  const other: Lang = lang === "zh" ? "ja" : "zh";
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
      {(["zh", "ja"] as const).map((target) => (
        <a
          key={target}
          href={`${basePath}/${target}${rest}${suffix}`}
          className={`lang-switch__option ${lang === target ? "is-active" : ""}`}
          aria-current={lang === target ? "true" : undefined}
          aria-label={target === "zh" ? "中文" : "日本語"}
          onClick={() => remember(target)}
          title={target === "zh" ? "中文" : "日本語"}
        >
          <span className="lang-switch__full" aria-hidden>{target === "zh" ? "中文" : "日本語"}</span>
          <span className="lang-switch__short" aria-hidden>{target === "zh" ? "中" : "日"}</span>
        </a>
      ))}
    </div>
  );
}
