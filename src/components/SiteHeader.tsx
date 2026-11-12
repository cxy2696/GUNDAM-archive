"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CloseIcon,
  MenuIcon,
  MoonIcon,
  OrbitMark,
  SearchIcon,
  SunIcon,
} from "./Icons";
import { LanguageSwitch } from "./LanguageSwitch";
import { HudControls } from "./HudControls";
import type { Dictionary } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";

const navItems = [
  { key: "machines", path: "/machines" },
  { key: "techTree", path: "/tech-tree" },
  { key: "timeline", path: "/timeline" },
  { key: "chronology", path: "/chronology" },
  { key: "glossary", path: "/glossary" },
  { key: "map", path: "/map" },
  { key: "archive", path: "/archive" },
  { key: "about", path: "/about" },
] as const;

export function SiteHeader({ lang, dict }: { lang: Lang; dict: Dictionary }) {
  const pathname = usePathname() || "";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const path = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (target: string) => path === `/${lang}${target}` || path.startsWith(`/${lang}${target}/`);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("gundam-theme", next);
    } catch {
      /* private mode */
    }
    setTheme(next);
  };

  return (
    <>
      <a className="skip-link" href="#main">
        {lang === "zh" ? "跳到主要内容" : lang === "ja" ? "本文へスキップ" : "Skip to main content"}
      </a>
      <header className="header">
        <div className="header__inner">
          <Link href={`/${lang}`} className="brand" aria-label="GUNDAM Archive home">
            <span className="brand__mark">
              <OrbitMark size={30} />
            </span>
            <span className="brand__word">
              <span className="brand__gundam">GUNDAM</span>
              <span className="brand__archive">ARCHIVE</span>
            </span>
          </Link>

          <nav className="nav" aria-label={lang === "zh" ? "主导航" : lang === "ja" ? "メインナビゲーション" : "Main navigation"}>
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${lang}${item.path}`}
                className={`nav__link ${isActive(item.path) ? "is-active" : ""}`}
              >
                {dict.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="header__actions">
            <span className="header__status" aria-hidden>
              <i />
              ONLINE
            </span>
            <button
              type="button"
              className="icon-btn search-trigger"
              onClick={() => window.dispatchEvent(new Event("gundam:search"))}
              aria-label={dict.common.search}
            >
              <SearchIcon size={17} />
              <kbd>⌘K</kbd>
            </button>
            <HudControls lang={lang} dict={dict} className="header__hud" />
            <LanguageSwitch lang={lang} dict={dict} />
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? dict.common.themeLight : dict.common.themeDark}
            >
              {theme === "dark" ? <SunIcon size={17} /> : <MoonIcon size={17} />}
            </button>
            <button
              type="button"
              className="icon-btn menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? dict.common.close : dict.common.menu}
            >
              {menuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu__inner">
          <div className="mobile-menu__label">{dict.site.name}</div>
          {navItems.map((item, index) => (
            <Link key={item.key} href={`/${lang}${item.path}`} className="mobile-menu__link" tabIndex={menuOpen ? 0 : -1}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {dict.nav[item.key]}
            </Link>
          ))}
          <div className="mobile-menu__footer">
            <button type="button" className="text-btn" onClick={() => { setMenuOpen(false); window.dispatchEvent(new Event("gundam:search")); }} tabIndex={menuOpen ? 0 : -1}>
              <SearchIcon size={16} /> {dict.common.search}
            </button>
            <button type="button" className="text-btn" onClick={toggleTheme} tabIndex={menuOpen ? 0 : -1}>
              {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
              {theme === "dark" ? dict.common.themeLight : dict.common.themeDark}
            </button>
            <HudControls lang={lang} dict={dict} className="hud-inline--menu" />
            {menuOpen && <LanguageSwitch lang={lang} dict={dict} className="lang-switch--menu" />}
          </div>
        </div>
      </div>
    </>
  );
}
