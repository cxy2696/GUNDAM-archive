import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBundle } from "@/lib/content";
import { getDict, isLang, languageAlternates } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { ArrowUpRightIcon, OrbitMark } from "@/components/Icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const dict = getDict(lang);
  return {
    title: dict.about.title,
    description: dict.about.lead,
    alternates: { canonical: `/${lang}/about/`, languages: languageAlternates("/about/") },
  };
}

const layerText = {
  zh: [
    { id: "L1", name: "表现层", detail: "Next.js 15 App Router · 静态导出 · R3F", status: "as-built" },
    { id: "L2", name: "应用层", detail: "React Server Components · 构建期数据装载", status: "as-built" },
    { id: "L3", name: "服务层", detail: "目标：NestJS + Zod · 当前由构建期校验替代", status: "planned" },
    { id: "L4", name: "数据层", detail: "content/*.json + Zod · 目标 PostgreSQL 16 + JSONB", status: "as-built" },
    { id: "L5", name: "资产层", detail: "程序化 LOD-P · 目标 glTF 2.0 + KTX2 + CDN", status: "partial" },
    { id: "L6", name: "运营层", detail: "npm run validate · GitHub Actions · 内容 PR 门禁", status: "as-built" },
  ],
  en: [
    { id: "L1", name: "Presentation", detail: "Next.js 15 App Router · static export · R3F", status: "as-built" },
    { id: "L2", name: "Application", detail: "React Server Components · build-time data loading", status: "as-built" },
    { id: "L3", name: "Service", detail: "Target: NestJS + Zod · currently replaced by build-time checks", status: "planned" },
    { id: "L4", name: "Data", detail: "content/*.json + Zod · target PostgreSQL 16 + JSONB", status: "as-built" },
    { id: "L5", name: "Assets", detail: "Procedural LOD-P · target glTF 2.0 + KTX2 + CDN", status: "partial" },
    { id: "L6", name: "Operations", detail: "npm run validate · GitHub Actions · content PR gate", status: "as-built" },
  ],
  ja: [
    { id: "L1", name: "プレゼンテーション", detail: "Next.js 15 App Router · 静的書き出し · R3F", status: "as-built" },
    { id: "L2", name: "アプリケーション", detail: "React Server Components · ビルド時データ読込", status: "as-built" },
    { id: "L3", name: "サービス", detail: "目標：NestJS + Zod · 現在はビルド時検証で代替", status: "planned" },
    { id: "L4", name: "データ", detail: "content/*.json + Zod · 目標 PostgreSQL 16 + JSONB", status: "as-built" },
    { id: "L5", name: "アセット", detail: "プロシージャルLOD-P · 目標 glTF 2.0 + KTX2 + CDN", status: "partial" },
    { id: "L6", name: "運用", detail: "npm run validate · GitHub Actions · コンテンツPRゲート", status: "as-built" },
  ],
} as const;

const pipelineText = {
  zh: [
    { n: "01", t: "CONTENT", d: "content/*.json 新增或修改条目" },
    { n: "02", t: "SCHEMA", d: "zod 校验字段、外键与引用" },
    { n: "03", t: "BUILD", d: "静态导出，生成 zh/ja 双语页面" },
    { n: "04", t: "SHIP", d: "CDN / GitHub Pages，缓存哈希失效" },
  ],
  en: [
    { n: "01", t: "CONTENT", d: "Add or edit an entry in content/*.json" },
    { n: "02", t: "SCHEMA", d: "Zod checks fields, foreign keys and references" },
    { n: "03", t: "BUILD", d: "Static export generates zh / ja / en pages" },
    { n: "04", t: "SHIP", d: "CDN / GitHub Pages, cache busted by hash" },
  ],
  ja: [
    { n: "01", t: "CONTENT", d: "content/*.json の項目を追加・修正" },
    { n: "02", t: "SCHEMA", d: "zod でフィールド・外部参照を検証" },
    { n: "03", t: "BUILD", d: "静的書き出し、zh/ja 二言語ページを生成" },
    { n: "04", t: "SHIP", d: "CDN / GitHub Pages、ハッシュでキャッシュ更新" },
  ],
} as const;

const extra = {
  zh: {
    asBuilt: "已落地",
    partial: "部分",
    planned: "规划",
    pipeline: "内容更新链路",
    pipelineLead: "新增一台机体不改页面代码：放入 JSON，跑一次校验，重新构建即可。",
    schemaTitle: "单一真相源",
    schemaText: "src/lib/schema.ts 同时约束数据结构与 TypeScript 类型。构建期通过 zod 解析每个文件，任何字段、外键或谱系环问题都会让构建失败，而不是带着错误上线。",
    repoTitle: "仓库入口",
    docs: [
      { path: "docs/CHRONOLOGY.md", label: "十二纪元世纪表与阅读路径" },
      { path: "docs/MACHINE_COVERAGE.md", label: "机体覆盖范围与收录规则" },
      { path: "docs/ARCHITECTURE.md", label: "架构与决策记录" },
      { path: "docs/CONTENT_GUIDE.md", label: "新增机体 / 事件 / 人物的操作手册" },
      { path: "docs/DATA_DICTIONARY.md", label: "数据字典与单位规范" },
      { path: "docs/ASSET_PIPELINE.md", label: "glTF / LOD / manifest 规范" },
      { path: "docs/GOVERNANCE.md", label: "出处分级、争议与版权规则" },
    ],
    roadmapTitle: "从 V2.2 到 V2.3",
    roadmapNote: "当前版本是“可运行的档案骨架”，不是最终形态。下一步优先接入真实 glTF 资产与后端内容服务。",
    version: "VERSION",
    cut: "DATA CUT",
    licenseTitle: "版权与许可",
    disclaimer: "非官方粉丝项目，与 Bandai Namco / 创通・Sunrise 无关联。",
  },
  en: {
    asBuilt: "Shipped",
    partial: "Partial",
    planned: "Planned",
    pipeline: "Content pipeline",
    pipelineLead: "Adding a suit does not touch page code: drop in JSON, run the checks, rebuild.",
    schemaTitle: "Single source of truth",
    schemaText: "src/lib/schema.ts defines both the data shape and the TypeScript types. Zod parses every file at build time, so a bad field, foreign key or lineage loop stops the build instead of shipping.",
    repoTitle: "Repository",
    docs: [
      { path: "docs/CHRONOLOGY.md", label: "Twelve-era table and reading paths" },
      { path: "docs/MACHINE_COVERAGE.md", label: "Suit coverage and inclusion rules" },
      { path: "docs/ARCHITECTURE.md", label: "Architecture and decision record" },
      { path: "docs/CONTENT_GUIDE.md", label: "How to add a suit, event or character" },
      { path: "docs/DATA_DICTIONARY.md", label: "Data dictionary and units" },
      { path: "docs/ASSET_PIPELINE.md", label: "glTF / LOD / manifest rules" },
      { path: "docs/GOVERNANCE.md", label: "Source tiers, disputes and copyright" },
    ],
    roadmapTitle: "From v3.1 to v3.2",
    roadmapNote: "This release is a working archive, not the final form. Next up: real glTF assets and a content service.",
    version: "VERSION",
    cut: "DATA CUT",
    licenseTitle: "Copyright and licence",
    disclaimer: "Unofficial fan project. Not affiliated with Bandai Namco or Sotsu・Sunrise.",
  },
  ja: {
    asBuilt: "実装済み",
    partial: "一部",
    planned: "計画",
    pipeline: "コンテンツ更新フロー",
    pipelineLead: "機体の追加にページコードの変更は不要。JSONを置き、検証を実行し、再ビルドするだけ。",
    schemaTitle: "単一の真実源",
    schemaText: "src/lib/schema.ts がデータ構造とTypeScript型を同時に拘束する。ビルド時にzodが各ファイルを解析し、フィールド・外部参照・系譜の循環のいずれかに問題があればビルドを止める。",
    repoTitle: "リポジトリ",
    docs: [
      { path: "docs/CHRONOLOGY.md", label: "十二紀元の世紀表と読み方" },
      { path: "docs/MACHINE_COVERAGE.md", label: "機体カバレッジと収録規則" },
      { path: "docs/ARCHITECTURE.md", label: "アーキテクチャと意思決定" },
      { path: "docs/CONTENT_GUIDE.md", label: "機体・事件・人物の追加手順" },
      { path: "docs/DATA_DICTIONARY.md", label: "データ辞書と単位規約" },
      { path: "docs/ASSET_PIPELINE.md", label: "glTF / LOD / manifest 規約" },
      { path: "docs/GOVERNANCE.md", label: "出典区分・係争・著作権ルール" },
    ],
    roadmapTitle: "V2.2 から V2.3 へ",
    roadmapNote: "現在の版は「動く档案の骨格」であり最終形ではない。次は実glTFアセットとバックエンドのコンテンツサービスを優先する。",
    version: "VERSION",
    cut: "DATA CUT",
    licenseTitle: "著作権とライセンス",
    disclaimer: "非公式ファンプロジェクト。バンダイナムコ / 創通・サンライズとは無関係。",
  },
} as const;

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const typed = lang as Lang;
  const dict = getDict(typed);
  const bundle = getBundle();
  const t = extra[typed];
  const layers = layerText[typed];
  const pipeline = pipelineText[typed];
  const statuses = ["done", "done", "done", "partial", "next", "next"];

  return (
    <div className="about">
      <header className="about-head">
        <div className="container">
          <div className="page-head__crumb">
            <span className="mono">GUNDAM / ABOUT</span>
            <span className="mono">V3.2.0 / 2026.11.12</span>
          </div>
          <div className="about-head__mark">
            <OrbitMark size={54} />
          </div>
          <div className="eyebrow">{dict.about.eyebrow}</div>
          <h1>{dict.about.title}</h1>
          <p className="about-head__lead">{dict.about.lead}</p>
          <div className="about-head__meta">
            <span className="micro">{t.version} 3.2.0</span>
            <span className="micro">{t.cut} 2026.11.12</span>
            <span className="micro">{bundle.machines.length} MS / {bundle.events.length} EVENTS</span>
          </div>
        </div>
      </header>

      <div className="container about-body">
        <section className="about-section about-section--two">
          <div>
            <span className="micro">01 / THESIS</span>
            <h2>{dict.about.thesisTitle}</h2>
          </div>
          <p>{dict.about.thesis}</p>
        </section>

        <section className="about-section">
          <div className="about-section__head">
            <span className="micro">02 / ARCHITECTURE</span>
            <h2>{dict.about.archTitle}</h2>
            <p>{dict.about.arch}</p>
          </div>
          <div className="arch-layers">
            {layers.map((layer) => (
              <div key={layer.id} className="arch-row">
                <span className="arch-row__id mono">{layer.id}</span>
                <b>{layer.name}</b>
                <span className="arch-row__detail">{layer.detail}</span>
                <span className={`arch-row__status arch-row__status--${layer.status}`}>
                  {layer.status === "as-built" ? t.asBuilt : layer.status === "partial" ? t.partial : t.planned}
                </span>
              </div>
            ))}
          </div>
          <div className="about-points">
            {Object.values(dict.about.archPoints).map((point, index) => (
              <div key={point} className="about-point">
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <div className="about-section__head">
            <span className="micro">03 / PIPELINE</span>
            <h2>{t.pipeline}</h2>
            <p>{t.pipelineLead}</p>
          </div>
          <div className="pipeline">
            {pipeline.map((step) => (
              <div key={step.n} className="pipeline__step">
                <span className="pipeline__num mono">{step.n}</span>
                <b>{step.t}</b>
                <p>{step.d}</p>
              </div>
            ))}
          </div>
          <div className="about-callout">
            <span className="micro">{t.schemaTitle}</span>
            <p>{t.schemaText}</p>
            <code>src/lib/schema.ts</code>
          </div>
        </section>

        <section className="about-section about-section--two">
          <div>
            <span className="micro">04 / GOVERNANCE</span>
            <h2>{dict.about.govTitle}</h2>
          </div>
          <div>
            <p>{dict.about.gov}</p>
            <div className="about-sources">
              {(["S", "A", "B", "C"] as const).map((level) => (
                <div key={level} className="about-source">
                  <span className={`source-level source-level--${level}`}>{level}</span>
                  <div>
                    <b>{dict.sourceLevel[level]}</b>
                    <span>{dict.home[`source${level}Desc`]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section" id="roadmap">
          <div className="about-section__head">
            <span className="micro">05 / ROADMAP</span>
            <h2>{dict.about.roadmapTitle}</h2>
            <p>{t.roadmapNote}</p>
          </div>
          <div className="roadmap">
            {Object.values(dict.about.roadmap).map((item, index) => (
              <div key={item} className={`roadmap__row roadmap__row--${statuses[index]}`}>
                <span className="roadmap__dot" />
                <span className="mono">M{index}</span>
                <p>{item}</p>
                <span className="roadmap__state mono">
                  {statuses[index] === "done" ? "DONE" : statuses[index] === "partial" ? "WIP" : "NEXT"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section about-section--two">
          <div>
            <span className="micro">06 / CONTRIBUTE</span>
            <h2>{dict.about.contributeTitle}</h2>
            <p>{dict.about.contribute}</p>
            <a className="btn btn--ghost btn--sm about-github" href="https://github.com/cxy2696/GUNDAM-archive" target="_blank" rel="noreferrer">
              GitHub Repository <ArrowUpRightIcon size={13} />
            </a>
          </div>
          <div>
            <span className="micro">{t.repoTitle}</span>
            <ul className="about-docs">
              {t.docs.map((doc) => (
                <li key={doc.path}>
                  <code>{doc.path}</code>
                  <span>{doc.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="about-section about-section--two" id="license">
          <div>
            <span className="micro">07 / LICENSE</span>
            <h2>{dict.about.licenseTitle}</h2>
          </div>
          <div>
            <p>{dict.about.license}</p>
            <p className="about-disclaimer">{dict.about.disclaimer}</p>
            <div className="about-bottom">
              <span className="micro">GUNDAM ARCHIVE / V3.2.0</span>
              <Link href={`/${typed}`} className="text-link">
                {dict.nav.home} <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
