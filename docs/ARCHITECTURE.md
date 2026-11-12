# 架构与决策记录

> 对应方案书第二章、第四章、第五章。本文记录 **当前实现（V2.2）** 与 **目标架构** 的差异，避免把路线图误读成现状。

## 1. 约束与目标

- 全栈 TypeScript，前后端共享类型；当前阶段先做内容与阅读体验，不先拆服务。
- 内容与代码分离：新增机体、事件、人物不改页面代码。
- 可静态托管：无数据库、无服务端运行时也能完整浏览。
- 构建即校验：内容错误必须阻止发布，而不是运行时 404。
- 3D 资产走 glTF 2.0 开放标准；当前用程序化占位资产先跑通交互与数据结构。

## 2. 六层模型（as-built / target）

| 层 | 目标（方案书） | 当前实现 | 迁移动作 |
| --- | --- | --- | --- |
| L1 表现层 | Next.js 15 + React 19 + R3F + Tailwind | Next.js 15 App Router + 手写 CSS Token + R3F | 可逐步引入 Tailwind，不改组件 API |
| L2 应用层 | Server Actions / tRPC / GraphQL | React Server Components + 构建期内容装载 | 详情页聚合查询可换成 GraphQL |
| L3 服务层 | NestJS + Zod | **构建期校验** + 纯函数领域逻辑 | 内容服务独立为 NestJS 模块 |
| L4 数据层 | PostgreSQL 16 + JSONB | `content/*.json` + Zod | Repository 接口后接 Drizzle/Prisma |
| L5 资产层 | 对象存储 + CDN + 图片服务 | 程序化 LOD-P + 本地 SVG/字体 | 接 glTF LOD0、KTX2、CDN |
| L6 运营层 | Admin + OpenTelemetry + Sentry | `validate` 脚本 + GitHub Actions | Admin、审计日志、监控 |

**边界原则**：页面只依赖 `src/lib/content.ts` 暴露的查询函数；未来换数据库时，页面不需要知道 SQL。查看器只依赖 `Machine.viewer` 与 `asset-manifest` 契约，不直接读内容文件。

## 3. 数据流

```
content/*.json
   │  fs.readFile + JSON.parse（构建期，仅服务端）
   ▼
src/lib/schema.ts  ── zod 结构校验
   ▼
src/lib/content.ts ── 外键 / 谱系 DAG / 双向关联校验
   ├─ 排序后的 Bundle
   ├─ 查询函数：getMachine / getLineage / getUsedTags ...
   └─ 检索索引：src/lib/search-index.ts
   ▼
Server Components（generateStaticParams / generateMetadata）
   ├─ 静态 HTML（zh / ja）
   ├─ 客户端组件 props（纯 JSON，可序列化）
   └─ sitemap / robots / manifest / 404
   ▼
next build (output: export) → out/ → CDN
```

所有内容读取都发生在构建期。客户端组件只接收已经裁剪好的纯数据；不会把 `fs` 或数据库驱动打进浏览器包。

## 4. 目录与模块职责

| 路径 | 职责 | 不允许做的事 |
| --- | --- | --- |
| `content/` | 唯一内容源 | 不写页面逻辑、不放官方美术素材 |
| `src/lib/schema.ts` | 结构、枚举、类型、跨文件校验 | 不依赖 React / DOM |
| `src/lib/content.ts` | 读文件、解析、排序、查询 | 不做 UI 格式化 |
| `src/lib/format.ts` | 日期、单位、归一化 | 不读文件 |
| `src/lib/tree.ts` | 谱系布局 | 不改数据 |
| `src/lib/search.ts` | 纯检索评分 | 不读文件（客户端安全） |
| `src/lib/search-index.ts` | 从 Bundle 生成索引 | 只允许服务端导入 |
| `src/components/viewer/` | 3D / 2D 查看器 | 不直接读内容文件 |
| `src/app/(site)/[lang]/` | 路由、元数据、页面拼装 | 不重复实现领域规则 |
| `scripts/validate-content.ts` | CI 门禁 | 不写生产数据 |

## 5. 内容管线

1. **读取**：`content/machines/*.json` 按文件名排序，其余文件为数组。
2. **结构校验**：每个文件单独 parse，错误信息带文件路径与字段路径。
3. **交叉校验**：`validateBundle` 检查 id 唯一、外键、DAG、双向关联。
4. **排序**：机体按纪元 `order` → 剧内年 → 型号；事件按日期。
5. **派生**：谱系入边/出边、检索索引、布局坐标在读取后计算，不写回内容。

失败示例：

```
content/machines/foo.json 未通过 schema 校验:
  · specs.heightOverall: Expected number, received string
  · viewer.head: Invalid enum value
```

构建直接失败，不会生成半套页面。

## 6. 查看器架构

```
MechViewer (client)
├─ 状态：mode 3d/2d/split、explode、quantum、wireframe、view、hovered
├─ MechStage (R3F Canvas)
│  ├─ Mech → buildMech(viewer) → part groups（partId / axis / order）
│  ├─ PieceMesh：RoundedBox / prism / cylinder / sphere / cone + Edges
│  ├─ QuantumField / QuantumRings / QuantumParticles
│  ├─ CameraRig + OrbitControls
│  └─ Grid / ContactShadows / Environment（程序化 Lightformer）
└─ DesignSheet (SVG)：相同 partId，hover 双向同步
```

- **程序化资产不是最终形态。** `buildMech()` 只消费 `viewer` 配置；未来 `asset-manifest` 提供 GLB 时，`MechStage` 可切换为 `useGLTF`，`partId` 与爆炸轴契约不变。
- **按需加载**：`MechViewer` 外壳（顶栏、控制台、设计图）立即渲染；只有 `MechStage`（three/R3F）通过 `next/dynamic` 异步加载。机体页首屏 JS 约 116KB，3D chunk 独立下载。
- **不用后处理链**：量子形态由 emissive/uniform 驱动的粒子、环与菲涅尔球体组合，避免额外 render target；换取低端设备可降级。
- **状态本地化**：查看器状态不进入全局 store；页面级交互不触发服务端请求。

## 7. 双语路由

- 路由：`/zh/...` 与 `/ja/...`，`[lang]` 段在 `generateStaticParams` 中固定为两种；机体、人物、事件、势力各有详情页，`/glossary` 汇总术语，`/chronology` 汇总世纪表。
- 目录：`app/(site)/[lang]/` 是站点组的 root layout，直接输出 `<html lang="ja">` 或 `zh-CN`；`app/(root)/` 承载 `/` 重定向页。这样每种语言都有正确的 `lang` 属性，而不是在客户端改。
- 元数据：每页 `alternates.languages` 输出 `zh-CN` / `ja-JP` / `x-default`。
- 内容：`name` / `summary` / `description` 均为 `{ zh, ja }`；schema 强制双语，避免半成品。
- 排版：`html lang` + `data-lang` 作用域切换字体栈与断行规则；数值使用统一等宽字体。
- 切换器：`LanguageSwitch` 同时出现在桌面头部、移动菜单与页脚；切换时保留 path / query / hash，并把 `scrollY` 写入 sessionStorage，由 `ScrollRestore` 在目标页恢复。活动语言有 `aria-current="true"`。
- 入口判定：`app/(root)/page.tsx` 是静态 splash；优先读 `gundam-lang`，否则按 `navigator.language` 选择 `/zh/` 或 `/ja/`。静态导出无法做服务端 Accept-Language 分流，这是有意的客户端方案。
- 缺失策略：当前内容全部双语；若未来出现缺译，按方案书 6.7 的降级规则显示原名 + 提示，不用机翻冒充人工稿。

## 8. 检索

- 构建期生成 487 条索引（148 机体 + 114 人物 + 82 势力 + 69 事件 + 42 作品 + 32 技术标签）。
- 纯客户端评分：精确/前缀 > 多词命中 > 包含 > 拉丁拼写近似；同分时按类型加权。
- 索引字段：中/日/英名、型号、别名、驾驶员、阵营、纪元、摘要、技术标签与详情首段。
- `⌘K` 面板与 `/search` 共用 `searchEntries()`；面板是快速入口，检索页是可分享的完整结果。

## 9. 部署与缓存

- `output: "export"`：`out/` 可直接放 CDN；无 Node 运行时。
- 内容更新 = 重新构建，构建产物文件名带内容哈希，CDN 自然失效。
- GitHub Pages 项目页通过 `NEXT_PUBLIC_BASE_PATH` 适配子路径。
- 当前没有 Redis / ISR；对于“内容变更频率低、读多写少”的档案站，这是成本更低的正确选择。

## 10. 决策记录（ADR 摘要）

| 决策 | 选择 | 理由 | 代价 |
| --- | --- | --- | --- |
| ADR-001 | 静态导出优先 | 无运行时、CDN 友好、可 GitHub Pages | 无实时写/登录 |
| ADR-002 | JSON + Zod 作为当前数据层 | 内容契约先固定，迁移 DB 成本低 | 无事务/并发编辑 |
| ADR-003 | 程序化 LOD-P | 先验证交互与 partId 契约，不被美术阻塞 | 观感非最终品质 |
| ADR-004 | 客户端索引检索 | 数据量小，零后端 | 大数据量需 Meilisearch |
| ADR-005 | 不用 Tailwind | 视觉系统高度定制，手写 Token 更可控 | 需要维护 CSS |
| ADR-006 | 每台机体一个 JSON | PR 冲突小、评审边界清晰 | 读取时需合并 |

## 11. 迁移到服务层的路径

1. 把 `content.ts` 的查询函数抽成 `ContentRepository` 接口。
2. 新建 `apps/api`（NestJS/Fastify），实现同一接口，接 PostgreSQL。
3. 内容 JSON 作为 seed；Admin 写入 `content_version` 快照。
4. 页面从构建期调用改为 ISR/SSR 或构建期拉取 API。
5. 查看器资产切换到 `machine_asset` + 签名 URL；manifest 契约不变。

迁移不需要改页面组件、查看器或 schema；只需要换 `content.ts` 的实现与部署方式。

## 12. v3 座舱外壳、宇宙地图与关系图

- **座舱外壳**：`src/styles/cockpit.css` 定义金属边框、舱盖背景、侧 MFD 与操纵台；`CockpitRails` 只在 ≥1760px 显示，`CockpitConsole` 在 ≤980px 变为抽屉。外壳不改变页面 DOM 契约，页面仍按原 `container` 排版。
- **宇宙地图**：`content/atlas.json` 是唯一数据源，`src/lib/geo.ts` 负责 2D 正交投影与 3D 坐标，`Atlas2D` 用 SVG，`Atlas3D` 用 R3F + CanvasTexture 生成地球贴图；二者共享同一批节点与选中状态。2D 的 Lagrange 位置由 `lagrangeOrbit()` 从地月几何推导，表面点由 `globePoint()` 投影；3D 只把距离压缩，不改变归属。
- **关系图**：`src/lib/graph.ts` 从实体引用生成 `GraphData`（中心节点、分区节点、边），`RelationGraph` 负责放射布局、分组弧、碰撞规避与文本索引。图形是纯派生数据，不写入 JSON；新增实体只需补引用，页面自动获得图。
- **3D 纪元年轮**：`components/chronology/EraWheel3D.tsx` 以机体数决定环半径、以 `order` 决定高度；`EraDemo` 负责选择、URL 同步与 12 列分布图。
- **缩放与全屏**：`ZoomFrame` 负责地图、纪元年轮、关联图与 3D 视图的缩放与全屏（全屏用 portal 挂到 `body`，避免被座舱的 `backdrop-filter` 限制）；`TextZoom` 用 CSS 变量放大世纪表文字而不改变布局。
- **3D 关联图**：`RelationGraph3D` 复用 `GraphData`，把分组节点放在放射状三维层，边用曲线连接，支持旋转、缩放、标签开关与点击跳转；所有 `RelationGraph` 实例都能在 2D/3D 间切换。
- **构建校验**：`scripts/check-links.mjs` 在 build 后遍历 `out/**/*.html`，校验站内 href、目录式 URL 与 `#fragment`；`npm run check` 串起内容、文档、类型、语言、构建、链接与路由七道门；GitHub Pages 构建使用 `NEXT_PUBLIC_BASE_PATH`，审计脚本会自动识别 `/仓库名` 前缀。
