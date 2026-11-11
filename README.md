# GUNDAM Archive · 机动战士档案

[中文](README.md) ｜ [日本語](README.ja.md) ｜ [在线站点](https://cxy2696.github.io/GUNDAM-archive/zh/) ｜ [GitHub](https://github.com/cxy2696/GUNDAM-archive)

> 一座可交互、可追溯、可维护的机动战士档案馆。  
> 3D 检阅 · 技术谱系 · 纪元年表 · 地球圈地图 · 中日双语

**Next.js 15 · React 19 · TypeScript · Three.js / R3F · Zod · 静态导出 · JSON 驱动**

> 非官方粉丝考据项目，与 Bandai Namco / 创通・Sunrise 无关联。代码 MIT，原创内容 CC BY-NC-SA 4.0。详见 [NOTICE](NOTICE)。

## 30 秒读懂

- **这是什么**：一个静态的、JSON 驱动的高达档案站，把机体、纪年、谱系、人物与出处放在同一个可读结构里。
- **现在有什么**：**147 台机体 · 12 个纪元 · 114 位人物 · 42 部作品 · 49 条事件 · 37 个势力 · 31 个受控标签 · 115 条谱系边**；`/zh` 与 `/ja` 双语，共 **714 个静态页面**。
- **先看哪三页**：[世纪表](https://cxy2696.github.io/GUNDAM-archive/zh/chronology/) 看全系列 → [机体总表](https://cxy2696.github.io/GUNDAM-archive/zh/chronology/#roster-title) 查所有机体 → [覆盖说明](docs/MACHINE_COVERAGE.md) 看收录边界。
- **可信度**：机体与事件有 `sources`；未核对参数标 `seed`，冲突标 `disputed`；没有的参数显示“资料未载”，不估算。

> **范围**：收录 11 个正史纪元的高达型主线机体与核心外传机体，另保留 2 台 A.A. 原创扩展。不是 5,000+ 全衍生型号图鉴，也不含官方设计图。收录规则见 [MACHINE_COVERAGE](docs/MACHINE_COVERAGE.md)。

## 这次更新（V2.3）

| 你关心的 | 现在有什么 |
| --- | --- |
| **驾驶舱界面** | 全站 HUD：四角框线、扫描线、跟随指针的准星、链路状态；`HUD` 开关与 `A+ / A−` 阅读字号切换，偏好写入 localStorage |
| **可读性** | 正文基准 16px，机体简介、事件正文、人物传记、术语解释统一放大；切换大字模式后正文再放大一档 |
| **术语与技术词条** | 新增 `/[lang]/glossary`：31 个技术标签逐条解释“是什么 / 机制 / 取舍 / 历史作用”，另加 12 个阅读术语与纪元速查 |
| **事件档案** | 49 个事件全部补写“事件经过”，并新增 `/[lang]/events/[slug]` 完整档案页：经过、结果、参战方、机体、人物、出处、前后事件 |
| **机师与人物** | 人物从 73 位增至 114 位；补齐 GAT-X 五机、流星作战、秃鹫、铁华团、Urdr Hunt 等机体的驾驶员，并加入玛琉、穆、迪兰达尔、迪安娜、琪耶尔等关键人物 |
| **技术细节** | 机体页新增“技术构成”：动力、装甲、骨架、系统、武装构成均由受控标签和技术参数生成，可跳到术语页 |
| **MS 谱系** | 谱系边从 82 条增至 115 条；147 台机体全部接入谱系图，GP 系列、GAT-X、AGE、巴巴托斯系、异端、魔灵系等补齐同系连接 |
| **文字去模板化** | 147 台机体、114 位人物、49 个事件、31 个技术词条逐条改写；删掉“不是…而是”“真正的”“故事”等模板句，新增 [EDITORIAL](docs/EDITORIAL.md) 与 CI 语言门禁 |
| **前版内容** | 147 台机体、12 个纪元、73 位人物、42 部作品、50 条事件、35 个势力、31 个标签、82 条谱系边 |

## 怎么读这个站

1. **先看世纪表**：一分钟版表格告诉你每个纪元的历法、跨度、作品与机体数量；再展开任一纪元的全机体总表。
2. **再进机体页**：每台机体都有纪元、势力、初登场、武装、驾驶员、谱系边与出处；3D 为程序化预览，不是官方模型。
3. **想追技术路线**：打开 [技术谱系](https://cxy2696.github.io/GUNDAM-archive/zh/tech-tree/)，按技术标签高亮；每条边都能回到两台机体。
4. **遇到不懂的词**：打开 [术语与技术词条](https://cxy2696.github.io/GUNDAM-archive/zh/glossary/)，按类别筛选或直接搜索；每个词条都列出使用它的机体。
5. **想看完整事件**：在年表点开事件抽屉，或直接进入事件档案页；那里有经过、结果、参战方与前后事件。
6. **想改内容**：从 [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) 开始；新增机体不需要改页面代码。

## 怎么读这个站

1. **先看世纪表**：一分钟版表格告诉你每个纪元的历法、跨度、作品与机体数量；再展开任一纪元的全机体总表。
2. **再进机体页**：每台机体都有纪元、势力、初登场、武装、驾驶员、谱系边与出处；3D 为程序化预览，不是官方模型。
3. **想追技术路线**：打开 [技术谱系](https://cxy2696.github.io/GUNDAM-archive/zh/tech-tree/)，按技术标签高亮；每条边都能回到两台机体。
4. **想改内容**：从 [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) 开始；新增机体不需要改页面代码。

![GUNDAM Archive 首页](preview/home.png)

## 项目概览

高达系列横跨多个纪元与作品，资料分散在动画、设定集、模型说明书与社区 Wiki 中。机体参数口径不一、纪元年表彼此割裂，技术演进往往要翻十几部作品才能比对。

GUNDAM Archive 把散落的知识组织成**可交互、可追溯、可继续生长**的结构，而不是再做一个资料站。

| 主线 | 用户问题 | 对应能力 |
| --- | --- | --- |
| **检阅** Inspect | 这台机体长什么样？由哪些部件构成？ | 3D 查看器、爆炸拆解、分件高亮、量子形态、2D 分层设计图 |
| **追溯** Trace | 它从哪里来？后来变成了什么？ | 带技术标签的有向无环谱系图，三种边类型，每条边附出处 |
| **定位** Locate | 它在哪一年、哪场战争、哪个地点出现？ | 十二纪元泳道年表、地球圈/拉格朗日点示意地图、事件抽屉 |

A.A. 后启示录是本仓库的原创扩展纪元：XARX-0 高达 ZERO、螺旋高达，以及《机动战士高达 RG XARX-ZERO》《GUNDAM 异轨征途》两部作品；它与 11 个正史纪元分开阅读。

| A.A. 年表 | XARX-0 高达 ZERO |
| --- | --- |
| ![A.A. 纪元年表](preview/aa-era.png) | ![XARX-0](preview/xarx.png) |

当前内容：**147 台机体 · 12 个纪元 · 49 条事件 · 37 个势力 · 114 位人物 · 42 部作品 · 15 个地点 · 31 个受控标签 · 115 条谱系边**；`/zh` 与 `/ja` 双语，共 **714 个静态页面**，构建期生成 **420 条检索索引**。

## 在线访问

| | |
| --- | --- |
| **中文站点** | https://cxy2696.github.io/GUNDAM-archive/zh/ |
| **日文站点** | https://cxy2696.github.io/GUNDAM-archive/ja/ |
| **仓库** | https://github.com/cxy2696/GUNDAM-archive |
| **Actions** | https://github.com/cxy2696/GUNDAM-archive/actions |
| **版本** | v1.4.0 |

站点由 GitHub Actions 静态构建并部署到 GitHub Pages。仓库为 public；如需私有化，可在 Settings → General → Danger Zone 调整。

## 界面

| 首页 · 3D 检阅 | 机体索引 · 147 台 |
| --- | --- |
| ![首页](preview/home.png) | ![机体索引](preview/machines.png) |

| 机体档案 · 参数与谱系 | 移动端 · 语言切换 |
| --- | --- |
| ![机体详情](preview/machine.png) | ![移动端](preview/mobile.png) |

| 术语与技术词条 · 31 条 | 事件档案 · 49 条 |
| --- | --- |
| ![术语页](preview/glossary.png) | ![事件档案](preview/event.png) |

| 人物档案 · 服役记录 | 技术构成 · 动力/装甲/骨架 |
| --- | --- |
| ![人物档案](preview/character.png) | ![技术构成](preview/technical.png) |

| MS 谱系 · 115 条边 | 纪元年表 |
| --- | --- |
| ![技术谱系](preview/tech-tree.png) | ![纪元年表](preview/timeline.png) |

| 宇宙地图 | 量子形态 |
| --- | --- |
| ![宇宙地图](preview/map.png) | ![量子形态](preview/quantum.png) |

| 十二纪元世纪表 |
| --- |
| ![世纪表](preview/chronology.png) |

设计与工程图联动见 [preview/design-sheet.png](preview/design-sheet.png)。

## 核心能力

- **检阅**：R3F 查看器支持轨道旋转、缩放、平移、视角预设、自动旋转、爆炸拆解、分件悬停、线框叠加；3D 引擎异步加载，不阻塞页面外壳。
- **量子形态**：0–100% 连续插值，粒子、能量环、装甲色相偏移与自发光同步；可在控制台随时关闭。
- **2D / 3D 联动**：3D、设计图、分屏三态；SVG 分层图与 3D 共享 `partId`，悬停双向高亮，支持工程图模式。
- **技术构成**：每台机体都有动力、装甲、骨架、系统与武装构成面板，技术标签可直接跳到术语页。
- **技术谱系**：U.C. 主谱系 DAG + 平行纪元机体目录，147 台、115 条边；`derive_of` / `tech_from` / `replace` 三种边，标签高亮与构建期无环校验。
- **纪元年表**：十二纪元泳道保留各自纪年尺度；年/十年/世纪刻度、主线过滤、U.C. 全史切换、事件详情抽屉。
- **关系档案**：势力组织树、五类关系、人物任期与驾驶机体、作品索引；`⌘K` 全局检索 + 独立检索页。
- **人物经历**：114 位人物的年龄、军衔/身份、出身与“服役记录”；驾驶机体与关联事件按时间排序，可直接跳到事件档案。
- **事件档案**：49 个事件全部有“事件经过”长文与独立档案页，包含结果、参战方、关联机体、人物、出处与前后事件。
- **术语与技术词条**：31 个受控技术标签逐条解释，按装甲/动力/传感/武器/系统/骨架分类筛选；另设 12 个阅读术语。
- **驾驶舱 HUD 与阅读模式**：HUD 开关、扫描线、准星、链路状态；`A+ / A−` 切换大字模式，正文与卡片同步放大。
- **中日双语**：`/zh` 与 `/ja` 路由，hreflang/canonical；桌面、移动端与页脚均可切换，保留路径、查询串、锚点与滚动位置；首次访问按浏览器语言选择入口。

## 快速开始

要求 Node.js ≥ 20.9（推荐 22）。

```bash
git clone https://github.com/cxy2696/GUNDAM-archive.git
cd GUNDAM-archive

pnpm install        # 或 npm install
pnpm dev            # http://localhost:3000
pnpm validate       # 内容 schema / 外键 / 谱系 / 双向关联
pnpm language:check # 编辑语言门禁（模板句、长度）
pnpm typecheck
pnpm build          # 静态导出到 out/
pnpm preview        # 本地预览 out/（需要 python3）
```

> 仓库使用 pnpm 锁文件；GitHub Actions 使用 pnpm。本地用 npm 运行脚本也可以。

## 内容即数据

新增一台机体不需要改页面代码：

1. 复制 [docs/templates/machine.template.json](docs/templates/machine.template.json) 到 `content/machines/<slug>.json`。
2. 填写名称、参数、武装、标签、驾驶员、事件、查看器配置与 `sources`；没有的参数写 `null`，不要估算。
3. 在相关机体补谱系边；每条边必须有 `sources`，且 `to` 指向已存在机体。
4. 若参与事件，在 `content/events.json` 补 `machineIds`，保持双向回指。
5. 运行 `pnpm validate && pnpm build`。

路由、卡片、检索索引、谱系图、年表、地图、势力与人物页会自动读取新数据。字段定义见 [DATA_DICTIONARY](docs/DATA_DICTIONARY.md)，操作步骤见 [CONTENT_GUIDE](docs/CONTENT_GUIDE.md)。

## 架构

```
content/*.json
   │  fs + JSON.parse（构建期，仅服务端）
   ▼
src/lib/schema.ts      Zod schema + 类型（唯一真相源）
src/lib/content.ts     解析、跨文件校验、查询
src/lib/tree.ts        DAG 布局
src/lib/search-index.ts
   ▼
app/(site)/[lang]      React Server Components → 714 个静态页面
   ▼
next build (output: export) → out/ → GitHub Pages
```

- **单一真相源**：`src/lib/schema.ts` 同时约束数据结构与 TypeScript 类型。
- **静态优先**：无数据库、无服务端运行时；内容更新 = 改 JSON → 校验 → 重建。
- **按需 3D**：页面外壳与 R3F Stage 分离，3D chunk 独立下载。
- **契约先行**：程序化 LOD-P 与未来 glTF 共用 `partId / axis / order / manifest`。

完整分层、决策记录与迁移路径见 [ARCHITECTURE](docs/ARCHITECTURE.md)。

## 文档地图

| 文档 | 负责什么 |
| --- | --- |
| [README.ja.md](README.ja.md) | 日本語の概要・起動方法 |
| [docs/README.md](docs/README.md) | 文档索引、权威边界、更新规则 |
| [docs/CHRONOLOGY.md](docs/CHRONOLOGY.md) | 十二纪元世纪表、逐纪元速查、阅读顺序 |
| [docs/EDITORIAL.md](docs/EDITORIAL.md) | 编辑风格、禁用模板句、事实与长度规则 |
| [docs/MACHINE_COVERAGE.md](docs/MACHINE_COVERAGE.md) | “全机体”的收录规则、覆盖矩阵、明确不包含什么 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 六层模型、数据流、查看器、部署、ADR、迁移 |
| [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) | 新增/修改内容、双语、审校清单、常见错误 |
| [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md) | 字段、枚举、单位、日期、校验规则（字段级权威） |
| [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md) | LOD、partId、manifest、Blender→glTF、验收 |
| [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md) | 外部资料源、合法接入流程、官方图版权边界 |
| [docs/GLOSSARY.md](docs/GLOSSARY.md) | 纪元、字段、工程词的人类可读解释 |
| [docs/GOVERNANCE.md](docs/GOVERNANCE.md) | 来源分级、争议、版权、审核、AI 规则 |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Token、字体、组件、动效、可访问性 |
| [docs/ROADMAP.md](docs/ROADMAP.md) | M0–M5、V2.x、内容批次、风险 |
| [CONTRIBUTING.md](CONTRIBUTING.md) | 开发/内容贡献流程、PR 要求 |
| [CHANGELOG.md](CHANGELOG.md) | 版本变更 |

> 权威顺序：`src/lib/schema.ts` → `DATA_DICTIONARY` → 其他文档。文档之间不重复维护字段表；新增字段先改 schema，再更新数据字典与指南。

## 按问题找文档

| 我想…… | 先读 |
| --- | --- |
| 快速理解全系列 | [世纪表](docs/CHRONOLOGY.md) → [术语表](docs/GLOSSARY.md) |
| 知道“到底收了哪些机体” | [机体覆盖表](docs/MACHINE_COVERAGE.md) |
| 新增一台机体 / 事件 / 人物 | [CONTENT_GUIDE](docs/CONTENT_GUIDE.md) → [DATA_DICTIONARY](docs/DATA_DICTIONARY.md) |
| 改字段或校验规则 | `src/lib/schema.ts` → [DATA_DICTIONARY](docs/DATA_DICTIONARY.md) |
| 判断出处能不能用 | [GOVERNANCE](docs/GOVERNANCE.md) → [DATA_SOURCES](docs/DATA_SOURCES.md) |
| 接 3D 资产 | [ASSET_PIPELINE](docs/ASSET_PIPELINE.md) |
| 看下一步计划 | [ROADMAP](docs/ROADMAP.md) → [CHANGELOG](CHANGELOG.md) |

## 质量门禁

`pnpm validate` 在构建前检查：

- **Schema**：字段类型、必填、枚举、slug 格式；
- **引用**：纪元/势力/人物/作品/地点/事件/标签/机体外键全部可解析；
- **谱系**：忽略 `replace` 后无环，边必须有出处，不能自指；
- **双向关联**：机体驾驶员 ↔ 人物机体；机体事件 ↔ 事件机体；人物事件 ↔ 事件人物；
- **解释完整性**：每个技术标签与事件必须有 `detail` 长解释；每位人物必须有 `age / rank / origin`；
- **语言**：`language:check` 扫描高频 AI 模板句、过长摘要与段落；
- **构建**：`next build` 在内容错误时失败。

双语字段的完整性由 schema 强制（`zh` / `ja` 必填）；数值与专有名词的一致性仍需人工二审，见 CONTENT_GUIDE。

## 部署

| 平台 | 方式 |
| --- | --- |
| GitHub Pages | `.github/workflows/deploy-pages.yml`，自动设置 `NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive` |
| Vercel / Cloudflare / Netlify | 构建命令 `pnpm build`，输出目录 `out` |

| 变量 | 用途 | 默认 |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | 子路径部署前缀 | 空 |
| `NEXT_PUBLIC_SITE_URL` | canonical / sitemap / OG 的绝对地址 | `https://cxy2696.github.io/GUNDAM-archive` |

## 已知边界

- **范围说明**：当前收录 **147 台机体**（145 台属于 11 个正史纪元，2 台为 A.A. 扩展），覆盖主线与核心外传；不是字面意义上的全部 5,000+ 衍生型号。收录规则、覆盖矩阵与“为什么 C.C. 只有 2 台”见 [MACHINE_COVERAGE](docs/MACHINE_COVERAGE.md)。
- **3D 是程序化 LOD-P 占位**，不是官方模型，也不是最终 glTF；分件、装配轴、爆炸顺序已按 `partId` 组织，接入 LOD0 不改查看器。
- **不使用官方设计图**：当前视觉为自绘 SVG / 程序化 3D；官方图、扫描设定集与 Wiki 图片不转存、不热链，授权素材的接入规则见 [DATA_SOURCES](docs/DATA_SOURCES.md)。
- **年龄/军衔/出身是公开设定整理**，标“约”的为推定；不同作品口径冲突时仍以 `seed` 呈现，不强行统一。
- **事件长解释是编辑重写**，不是官方原文；它服务于阅读，不替代设定集与正片。
- **数据是种子数据**：参数按公开资料整理，尚未逐项核对到设定集页码；界面标 `seed` 与 `disputed`。
- **出处覆盖不完整**：机体与事件有 `sources`；势力、人物、作品、地点、标签目前通过作品锚定，尚未逐条挂 `source_refs`。这是 M4 的明确任务，不把“有出处”说成全覆盖。
- **没有后端/数据库/Admin**；检索是构建期索引，更新走重新构建。
- 检索暂未做拼音/罗马字模糊匹配；视觉回归与真机性能门禁尚未接入（M4）。

## License

- **代码**：[MIT](LICENSE)
- **原创文本、图表、SVG、程序化几何**：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- **高达系列及相关名称、设定**：权利归创通・Sunrise / Bandai Namco；本项目为非商业粉丝作品，不含官方美术或模型素材。完整声明见 [NOTICE](NOTICE)。

---

**English tl;dr** — GUNDAM Archive is an unofficial, non-commercial, bilingual mobile-suit knowledge archive. It is a static Next.js 15 app with JSON content validated by Zod at build time, a procedural Three.js viewer (exploded view, part hover, quantum mode), a DAG tech tree, an eleven-era timeline, and a schematic Earth-sphere map. Content is data, not code: add a JSON file, run `pnpm validate && pnpm build`. Code is MIT; original content is CC BY-NC-SA 4.0.
