# GAIA Archive · 机动战士档案

> 一座可交互、可追溯、可维护的机动战士档案馆。  
> 3D 检阅 · 技术谱系 · 纪元年表 · 地球圈地图 · 中日双语 · 全部条目附出处

**Next.js 15 · React 19 · TypeScript · Three.js / R3F · Zod · 静态导出 · JSON 驱动**

> 非官方粉丝考据项目，与 Bandai Namco / 创通・Sunrise 无关联。代码 MIT，原创内容 CC BY-NC-SA 4.0。详见 [NOTICE](NOTICE)。

![GAIA Archive 首页](preview/home.png)

## 这是什么

高达系列横跨四十余年，官方与民间资料分散在动画、设定集、模型说明书、百科与社区 Wiki 中。机体参数口径不一、纪元年表彼此割裂，技术演进需要读者在十几部作品之间来回比对。

GAIA Archive 不是“又一个资料站”。它把散落的知识组织成**可交互、可追溯、可继续生长**的结构：

| 主线 | 用户问题 | 对应能力 |
| --- | --- | --- |
| **检阅** Inspect | 这台机体长什么样？由哪些部件构成？ | 3D 查看器、爆炸拆解、分件高亮、量子形态、2D 分层设计图 |
| **追溯** Trace | 它从哪里来？后来变成了什么？ | 带技术标签的有向无环谱系图，三种边类型，每条边附出处 |
| **定位** Locate | 它在哪一年、哪场战争、哪个地点出现？ | 七纪元泳道年表、地球圈/拉格朗日点示意地图、事件抽屉 |

首期内容：**12 台代表机体 · 7 个纪元 · 23 条关键事件 · 17 个势力 · 12 位人物 · 14 部作品 · 19 个受控技术标签 · 8 条谱系边**，中日双语路由，共 100 个静态页面。

## 界面

| 首页 · 3D 检阅 | 机体档案 · 参数与谱系 |
| --- | --- |
| ![首页](preview/home.png) | ![机体详情](preview/machine.png) |

| 技术谱系 | 纪元年表 |
| --- | --- |
| ![技术谱系](preview/tech-tree.png) | ![纪元年表](preview/timeline.png) |

| 宇宙地图 | 移动端 |
| --- | --- |
| ![宇宙地图](preview/map.png) | ![移动端](preview/mobile.png) |

设计语言是**工业科技风**：结构可见、信息分层、克制发光。深空黑底、1px 描边、等宽数值、工程图网格；量子形态只在明确状态语义下出现。

## 功能清单（V1.0）

- **3D 机体查看器**：按需异步加载；轨道旋转、缩放、平移、视角预设、自动旋转、爆炸拆解、分件悬停高亮、线框叠加
- **量子形态**：0–100% 连续插值，粒子解构 + 能量环路 + 色相偏移 + 菲涅尔场，低端设备可随时关闭
- **2D 设计图联动**：3D / 2D / 分屏三态，分层 SVG 线稿与 3D 共享 `partId`，悬停双向高亮，工程图模式
- **技术谱系**：12 节点有向图，`derive_of` / `tech_from` / `replace` 三种边，标签高亮、跨纪元节点、无环校验
- **纪元年表**：七条泳道，各自保留本地纪年尺度；年/十年/世纪刻度，主线过滤，U.C. 全史切换，事件详情抽屉
- **宇宙地图**：地球圈示意、L1–L5 轨道、地球/殖民地/深空地点、战役事件与关联机体
- **关系档案**：势力组织树、五类势力关系、人物任期、驾驶机体、参战事件、作品索引
- **检索**：`⌘K` 全局命令面板 + 独立检索页，覆盖中文名、日文原名、英文名、型号、别名
- **中日双语**：`/zh` 与 `/ja` 前缀，hreflang、canonical、语言切换保留当前路径
- **可维护性**：内容全部是 JSON；`zod` 单一真相源；构建期校验 schema、外键、谱系无环与双向关联；CI 四道门禁

## 快速开始

要求 Node.js ≥ 20.9（推荐 22）。

```bash
# 安装（任选其一）
pnpm install
# 或 npm install

# 开发
pnpm dev            # http://localhost:3000

# 内容校验（不启动浏览器）
pnpm validate

# 类型检查
pnpm typecheck

# 构建静态站点 → out/
pnpm build

# 本地预览静态产物（需要 python3）
pnpm preview        # http://localhost:4173/zh/
```

> 项目目前使用 pnpm 生成的 `pnpm-lock.yaml`。GitHub Actions 使用 pnpm；本地用 npm 也可以运行脚本。

## 内容更新：新增一台机体不改页面代码

1. 复制 [docs/templates/machine.template.json](docs/templates/machine.template.json) 到 `content/machines/<slug>.json`。
2. 填写名称、参数、武装、标签、驾驶员、事件、资产配置与 `sources`。参数没有就留 `null`，不要估算。
3. 在相关机体的 `edges` 中补谱系边；边的 `sources` 必填，且 `to` 必须指向已存在的机体。
4. 新机体若参与事件，在 `content/events.json` 的事件里补 `machineIds`，并保持双向回指。
5. 运行：

```bash
pnpm validate   # schema + 外键 + 谱系无环 + 双向关联
pnpm build      # 生成 /zh 与 /ja 页面、sitemap、静态 HTML
```

页面路由、卡片、检索索引、谱系图、年表、地图、势力与人物页会**自动**读取新数据。新增势力/人物/事件/作品同理，只需遵守 [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md)。

内容规范、双语审校与出处要求见 [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md)。

## 架构

```
content/*.json
     │
     ▼
src/lib/schema.ts      zod schema + 推导类型（唯一真相源）
src/lib/content.ts     构建期读取、解析、交叉校验
src/lib/tree.ts        谱系 DAG 布局
src/lib/search-index.ts 静态检索索引
     │
     ▼
Next.js 15 App Router · Server Components
     ├─ /[lang]                     首页
     ├─ /[lang]/machines            图鉴 + 筛选
     ├─ /[lang]/machines/[slug]     3D / 2D 档案
     ├─ /[lang]/tech-tree           DAG 谱系
     ├─ /[lang]/timeline            七纪元泳道
     ├─ /[lang]/map                 地球圈示意
     ├─ /[lang]/archive             势力 / 人物 / 作品
     ├─ /[lang]/factions/[slug]
     ├─ /[lang]/characters/[slug]
     ├─ /[lang]/search
     └─ /[lang]/about
     │
     ▼
output: export → out/ → 任意静态托管（Vercel / Pages / S3 / CDN）
```

**关键取舍**：V1 是“内容先行的静态档案”，不是完整后端。关系型数据库、NestJS 服务层与后台 Admin 在路线图中；当前用 JSON + 构建期校验把内容契约先固定下来，后续替换存储层时页面与查看器无需重写。完整决策记录见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 仓库结构

```
gaia-archive/
├─ content/                  # 唯一内容源（JSON）
│  ├─ machines/*.json        # 一台机体一个文件
│  ├─ eras / events / factions / characters / works / places / tags
│  └─ asset-manifests/       # glTF 资产清单（示例）
├─ src/
│  ├─ app/(site)/[lang]/...  # 双语路由与页面（每种语言一个 root layout）
│  ├─ components/
│  │  ├─ viewer/             # R3F 查看器、程序化机体、设计图
│  │  ├─ MachineCard.tsx
│  │  ├─ TechTreeExplorer.tsx
│  │  ├─ TimelineExplorer.tsx
│  │  └─ OrbitalMap.tsx
│  ├─ lib/                   # schema / content / tree / search / i18n
│  └─ styles/                # pages.css / viewer.css
├─ scripts/validate-content.ts
├─ docs/                     # 架构、内容、数据、资产、治理、设计系统、路线图
├─ public/                   # 字体、icon、OG、.nojekyll
├─ preview/                  # README 截图
└─ .github/workflows/        # CI + GitHub Pages
```

## 质量门禁

`pnpm validate` 会检查：

- **Schema**：字段类型、必填、枚举、slug 格式
- **引用**：纪元 / 势力 / 人物 / 作品 / 地点 / 事件 / 标签 / 机体外键全部可解析
- **谱系**：忽略 `replace` 边后必须无环；边必须有出处；不能自指
- **双向关联**：机体驾驶员 ↔ 人物机体清单；机体事件 ↔ 事件机体清单；人物事件 ↔ 事件人物清单
- **构建**：`next build` 在内容错误时直接失败

生产构建还会生成 `sitemap.xml`、`robots.txt`、`manifest.webmanifest`、`404.html`。

## 部署

### Vercel / Cloudflare Pages / Netlify

构建命令 `pnpm build`，输出目录 `out`。无需服务端运行时。

### GitHub Pages（项目页）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
2. 推送到 `main`，`.github/workflows/deploy-pages.yml` 会自动：
   - 以 `NEXT_PUBLIC_BASE_PATH=/<repo>` 构建；
   - 上传 `out/`；
   - 部署到 `https://<owner>.github.io/<repo>/`。

项目页必须设置 `NEXT_PUBLIC_BASE_PATH`；用户页/自定义域名留空。`public/.nojekyll` 已包含，避免 `_next` 被 Jekyll 忽略。

### 环境变量

| 变量 | 用途 | 默认 |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | 子路径部署前缀 | 空 |
| `NEXT_PUBLIC_SITE_URL` | canonical / sitemap / OG 的绝对域名 | `https://gaia-archive.example` |

## 已知限制（V1 的真实边界）

- **3D 资产是程序化占位（LOD-P），不是官方模型，也不是最终 glTF 资产。** 所有分件、装配轴、爆炸顺序已按 `partId` 组织；接入 LOD0 的路径见 [docs/ASSET_PIPELINE.md](docs/ASSET_PIPELINE.md)。
- **数据是种子数据。** 参数按公开资料整理，但尚未逐项核对到设定集页码；界面会明确标注 `seed` 与 `disputed`。正式发布前必须完成二审。
- **没有后端与数据库。** 检索是构建期生成的客户端索引；内容更新走“改 JSON → 校验 → 重新构建”。这是有意的 V1 取舍，不是遗漏。
- **检索暂未做拼音/罗马字模糊匹配**，依靠人工维护的 `aliases` 覆盖常见写法。
- **尚未接入视觉回归与真机性能门禁**，这两项在 M4 路线图中。

## 路线图

| 阶段 | 内容 | 状态 |
| --- | --- | --- |
| M0 | 仓库、CI、设计 Token、Schema 定型 | 已完成 |
| M1 | 单机 3D 查看器、拆解、量子形态、详情页 | 已完成 |
| M2 | 12 台机体、年表、谱系、双语框架 | 已完成 |
| M3 | 人物、势力、地图、检索、动画系统 | 已完成（地图为示意层） |
| M4 | 40 台机体、glTF LOD0、真机性能、视觉回归 | 进行中 |
| M5 | 无障碍审计、SEO、监控、公测 | 待开始 |

V1.1 待议：对比面板、公开 API/数据包、太阳系视图、Spec 版本历史。详见 [docs/ROADMAP.md](docs/ROADMAP.md)。

## 参与

请先读 [CONTRIBUTING.md](CONTRIBUTING.md) 与 [docs/GOVERNANCE.md](docs/GOVERNANCE.md)。

- 内容修订必须附出处（作品集数、设定集页码或官方页面）。
- 新增/修改数据后运行 `pnpm validate`。
- 提交信息遵循 Conventional Commits；数据 PR 请附截图。
- 不接受无出处的“我记得是这样”，也不接受把社区 Wiki 当最终依据。

## License

- **代码**：[MIT](LICENSE)
- **本项目原创文本、图表、SVG、程序化几何**：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- **高达系列及相关名称、设定**：权利归创通・Sunrise / Bandai Namco；本项目为非商业粉丝作品，不含官方美术或模型素材。完整声明见 [NOTICE](NOTICE)。

---

**English tl;dr** — GAIA Archive is an unofficial, non-commercial, bilingual mobile-suit knowledge archive. It is a static Next.js 15 app with JSON content validated by Zod at build time, a procedural Three.js viewer (exploded view, part hover, quantum mode), a DAG tech tree, a seven-era timeline, and a schematic Earth-sphere map. Content is data, not code: add a JSON file, run `pnpm validate && pnpm build`. Code is MIT; original content is CC BY-NC-SA 4.0.
