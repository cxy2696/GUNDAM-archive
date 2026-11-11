import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDict, isLang } from "@/lib/i18n";
import { buildSearchIndex } from "@/lib/search-index";
import type { Lang } from "@/lib/schema";
import { SearchPageClient } from "@/components/SearchPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.search.title,
    description: dict.search.lead,
    alternates: { canonical: `/${lang}/search/`, languages: { "zh-CN": "/zh/search/", "ja-JP": "/ja/search/" } },
  };
}

export default async function SearchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const entries = buildSearchIndex(typed);

  return (
    <>
      <header className="page-head">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GAIA / RETRIEVAL</span>
            <span className="mono">{String(entries.length).padStart(3, "0")} INDEXED</span>
          </div>
          <div className="page-head__title-row">
            <div>
              <div className="eyebrow">{dict.search.eyebrow}</div>
              <h1>{dict.search.title}</h1>
            </div>
            <div className="page-head__figure" aria-hidden>
              <span className="mono">FIND</span>
              <span className="micro">NAME / CODE / ALIAS</span>
            </div>
          </div>
          <div className="page-head__row">
            <p>{dict.search.lead}</p>
          </div>
        </div>
      </header>
      <SearchPageClient entries={entries} lang={typed} dict={dict} />
    </>
  );
}
