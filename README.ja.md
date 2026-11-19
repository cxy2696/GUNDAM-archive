# GUNDAM Archive · モビルスーツアーカイブ

[中文](README.md) ｜ [日本語](README.ja.md) ｜ [English](README.en.md) ｜ [中文站](https://cxy2696.github.io/GUNDAM-archive/zh/) · [日本語サイト](https://cxy2696.github.io/GUNDAM-archive/ja/) · [English site](https://cxy2696.github.io/GUNDAM-archive/en/) ｜ [GitHub](https://github.com/cxy2696/GUNDAM-archive) ｜ [運用手順](docs/OPERATIONS.md)

> 閲覧でき、追跡でき、運用できるガンダム全紀元アーカイブ。  
> 12紀元の宇宙地図（2D/3D）· 3D関連グラフ · 技術系譜 · 中／日／英トリリンガル静的サイト

**Next.js 15 · React 19 · TypeScript · Three.js / R3F · Zod · 静的書き出し · JSON駆動**

> 非公式のファン考証プロジェクトです。バンダイナムコ／創通・サンライズとは無関係です。コードは MIT、オリジナルコンテンツは CC BY-NC-SA 4.0。詳細は [NOTICE](NOTICE) を参照してください。

## プロジェクト概要

**GUNDAM Archive** は、12紀元・42作品にまたがる機体、人物、事件、勢力、技術用語を、一件ずつ開けて出典まで戻れる構造にまとめたモビルスーツ知識アーカイブです。

サイトは完全静的な Next.js 書き出しです。内容は JSON で管理し、Zod がビルド時に検証します。日本語・中国語・英語の三言語、3D機体ビューア、技術系譜、紀元年表、2D/3D宇宙地図、関連グラフを備え、内容の追加にページコードの変更は不要です。`pnpm check` が内容・文書・型・言語・リンク・全エクスポートルートをまとめて検査します。

現在のバージョン：**v3.7.1**（2026-11-16）。  
現在のスナップショット：**148機体 · 12紀元 · 114人物 · 42作品 · 69事件 · 82勢力 · 32技術タグ · 116系譜辺 · 156地図ノード**。`/zh`・`/ja`・`/en` の三言語で **1280ページ**、**言語ごとに487件**の検索索引、**1272本**の sitemap ルート。

## 5分でわかる

- **これは何か**：JSON駆動の静的ガンダムアーカイブ。機体・紀元・系譜・人物・出典を一つの読みやすい構造にまとめる。
- **どこから読むか**：[世紀表](https://cxy2696.github.io/GUNDAM-archive/ja/chronology/) → [宇宙地図](https://cxy2696.github.io/GUNDAM-archive/ja/map/) → [収録範囲](docs/MACHINE_COVERAGE.md)。
- **信頼性**：機体と事件には `sources`。未確認値は `seed`、係争値は `disputed`。数値がない項目は「資料未載」で、推定しない。
- **更新**：内容は `content/`、手順は [CONTENT_GUIDE](docs/CONTENT_GUIDE.md)、公開・ロールバック・障害対応は [OPERATIONS](docs/OPERATIONS.md)。

> **範囲**：11の正史紀元のガンダム型主線機体と主要外伝機体、およびA.A.オリジナル拡張2機。5,000件超の全派生型図鑑ではなく、公式デザイン画像も含みません。

## 今回の更新（V3.7.1）

| 領域 | 現在の状態 |
| --- | --- |
| **関節分割** | 全機体の腕と脚を親部位＋肘/膝の子関節に分割。実際の関節位置で屈曲 |
| **C++歩行** | 歩行位相、脚の踏み出し、逆方向の腕振り、胴のひねり、接地上下、肘膝の屈曲をC++が計算 |
| **屈身** | C++ の屈身ブレンドが腰・胴・肘・膝・重心を同時に駆動。ポインタ照準も継続。+Z向きに合わせ肘/膝の方向を修正。コックピット座席はコンソール向き、視点は側面 |
| **コックピット** | 操縦桿、画面ベゼル、警告灯、動力/通信/武装ボタンを追加 |

## 主な機能

- **3Dビューア**：回転、ズーム、パン、視点プリセット、自動回転、分解、部位ホバー、ワイヤーフレーム。3Dエンジンは遅延読み込み。
- **量子形態**：0–100%の連続補間。粒子、エネルギーリング、装甲の色相偏移、発光を同期。
- **2D／3D連動**：3D、設計図、分割の3モード。SVGレイヤーと3Dが `partId` を共有し、ホバーが双方向に同期。
- **技術構成**：各機体に動力、装甲、フレーム、システム、武装構成。技術タグから用語ページへ移動。
- **技術系譜**：紀元別DAG、148機体・116辺。`derive_of` / `tech_from` / `replace` の3種。
- **紀元年表**：12紀元の泳道、年/十年/世紀目盛り、主線フィルタ、U.C.全史切替、イベントドロワー。
- **宇宙地図**：12紀元の2D戦術盤と3D惑星。U.C.のラグランジュ配置、C.E.のL3/L4/L5、A.D.の三基の軌道エレベーター、R.C.のエネルギー連鎖、P.D.の火星／第二の月など。
- **関係档案**：世紀別の勢力関係図、組織樹、5種の関係、人物の任期と搭乗機体、作品索引。
- **人物／事件**：114人物の服役記録、69事件の経過・結果・参戦勢力・関連機体・出典・前後事件。
- **用語**：32の統制技術タグ、検索マップ、関連ツリー、12の読解用語。
- **読書モード**：HUD切替、`A+ / A−` の大字モード、本文とカードを同期拡大。
- **三言語**：`/zh`・`/ja`・`/en`、hreflang/canonical、パス・クエリ・アンカー・スクロール位置を保持。

## クイックスタート

Node.js 22（20.9以上）、pnpm 10 を推奨。

```bash
git clone https://github.com/cxy2696/GUNDAM-archive.git
cd GUNDAM-archive
pnpm install
pnpm dev       # predev が検索索引を生成
pnpm check     # validate → docs → typecheck → language → build → links → routes
pnpm preview   # out/ をローカル表示（python3）
```

サブパスのローカル検証：

```bash
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive NEXT_PUBLIC_SITE_URL=https://cxy2696.github.io/GUNDAM-archive pnpm build
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive pnpm links:check
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive pnpm routes:check
```

## コンテンツはデータ

1. [docs/templates/machine.template.json](docs/templates/machine.template.json) を `content/machines/<slug>.json` にコピー。
2. 名称、諸元、武装、タグ、パイロット、事件、ビューア設定、`sources` を記入。不明値は `null`。
3. 関連機体に系譜辺を追加。各辺に `sources` が必要。
4. 事件に参加する場合は `content/events.json` の `machineIds` と双方向に回指。
5. `pnpm check` を実行し、[CONTENT_GUIDE](docs/CONTENT_GUIDE.md) に従って件数と文書を同期。

フィールドは [DATA_DICTIONARY](docs/DATA_DICTIONARY.md)、出典区分は [GOVERNANCE](docs/GOVERNANCE.md)、文章規則は [EDITORIAL](docs/EDITORIAL.md)。

## アーキテクチャ

```text
content/*.json ──Zod──▶ src/lib/content.ts ──▶ Server Components ──▶ next build
      │                         │
      ├─ atlas.json ──▶ geo.ts / Atlas2D / Atlas3D
      ├─ graph builders ──▶ RelationGraph / RelationGraph3D
      └─ build-search-index.ts ──▶ public/search-index.*.json（オンデマンドfetch）
```

- **単一の真実源**：`src/lib/schema.ts` がデータ構造とTypeScript型を同時に拘束。
- **静的優先**：DBもサーバーランタイムも不要。更新は JSON → 検証 → 再ビルド。
- **3Dは遅延読込**：ページシェルとR3F Stageを分離。
- **契約先行**：暫定LOD-Pと将来のglTFが `partId / axis / order / manifest` を共有。
- **監査**：`links:check` と `routes:check` をCI／Pagesで実行。

詳細は [ARCHITECTURE](docs/ARCHITECTURE.md)（中国語）。

## ドキュメント

| ドキュメント | 内容 |
| --- | --- |
| 入口 | 役割 |
| --- | --- |
| [docs/README.md](docs/README.md) | ドキュメント索引・権威の境界・更新ルール |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | 公開、ロールバック、監視、障害対応、定期保守 |
| [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) / [DATA_DICTIONARY](docs/DATA_DICTIONARY.md) | コンテンツ追加／フィールド定義 |
| [ARCHITECTURE](docs/ARCHITECTURE.md) / [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) | アーキテクチャ／視覚システム |
| [CHRONOLOGY](docs/CHRONOLOGY.md) / [MACHINE_COVERAGE](docs/MACHINE_COVERAGE.md) | 世紀表／収録範囲 |
| [ROADMAP](docs/ROADMAP.md) / [CHANGELOG](CHANGELOG.md) / [CONTRIBUTING](CONTRIBUTING.md) | 計画／変更履歴／貢献 |

> ドキュメントは中国語を主言語とします。日本語はこのREADMEとサイトUIで提供します。フィールド表はDATA_DICTIONARYだけに置き、他の文書では繰り返しません。

## 既知の境界

- **範囲**：148機体（11の正史紀元で146機、A.A.拡張で2機）。主線と主要外伝をカバーしますが、5,000件超の全派生型ではありません。
- **3DはプロシージャルLOD-Pの暫定アセット**です。公式モデルでも最終glTFでもありません。
- **公式デザイン画像は収録しません**。現在のビジュアルは自作SVG／プロシージャル3Dです。
- **データはシードデータ**です。公開資料に基づきますが、設定資料集の頁まで逐項確認していません。UIには `seed` / `disputed` を表示します。
- **出典の網羅性は未完成**です。機体と事件には `sources` がありますが、勢力・人物・作品・地点・タグは作品／紀元への紐付けのみです。
- バックエンド／DB／Adminはありません。検索はオンデマンド索引で、更新は再ビルドです。ピンイン／ローマ字検索、視覚回帰、実機性能ゲートは未対応です。

## ライセンス

- **コード**：[MIT](LICENSE)
- **オリジナルの文章・図表・SVG・プロシージャル形状**：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- **ガンダムシリーズおよび関連名称・設定**：創通・サンライズ／バンダイナムコに帰属。本プロジェクトは非商業のファン作品で、公式美術・模型素材を含みません。完全な声明は [NOTICE](NOTICE)。
