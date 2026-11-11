import Link from "next/link";
import { getBundle } from "@/lib/content";
import { getDict } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { OrbitMark } from "./Icons";
import { LanguageSwitch } from "./LanguageSwitch";

export function SiteFooter({ lang }: { lang: Lang }) {
  const dict = getDict(lang);
  const bundle = getBundle();
  const nav = [
    { href: `/${lang}/machines`, label: dict.nav.machines },
    { href: `/${lang}/tech-tree`, label: dict.nav.techTree },
    { href: `/${lang}/timeline`, label: dict.nav.timeline },
    { href: `/${lang}/map`, label: dict.nav.map },
    { href: `/${lang}/archive`, label: dict.nav.archive },
    { href: `/${lang}/about`, label: dict.nav.about },
  ];

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="footer__mark">
            <OrbitMark size={38} />
          </div>
          <div>
            <div className="footer__name">GUNDAM ARCHIVE</div>
            <p className="footer__tagline">{dict.site.tagline}</p>
          </div>
        </div>

        <div className="footer__cols">
          <div className="footer__col">
            <h3 className="micro">INDEX</h3>
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="footer__col">
            <h3 className="micro">DATA</h3>
            <span>{bundle.machines.length} MS / {bundle.events.length} EVENTS</span>
            <span>{bundle.eras.length} ERAS / {bundle.tags.length} TAGS</span>
            <span>DATA CUT · 2026.11.11</span>
            <Link href={`/${lang}/about`}>{dict.about.govTitle}</Link>
          </div>
          <div className="footer__col">
            <h3 className="micro">PROJECT</h3>
            <a href="https://github.com/cxy2696/GUNDAM-archive" target="_blank" rel="noreferrer">
              GitHub Repository
            </a>
            <Link href={`/${lang}/about#roadmap`}>{dict.about.roadmapTitle}</Link>
            <Link href={`/${lang}/about#license`}>{dict.about.licenseTitle}</Link>
            <span>v1.3.0</span>
          </div>
        </div>

        <div className="footer__bottom">
          <p>{dict.footer.disclaimer}</p>
          <div className="footer__legal">
            <span>{dict.footer.license}</span>
            <span className="footer__sep" aria-hidden>·</span>
            <span>{dict.footer.built}</span>
            <LanguageSwitch lang={lang} dict={dict} className="lang-switch--footer" />
          </div>
          <p className="footer__note">{dict.footer.sourceNote}</p>
        </div>
      </div>
      <div className="footer__wordmark" aria-hidden>
        GUNDAM
      </div>
    </footer>
  );
}
