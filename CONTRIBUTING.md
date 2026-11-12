# Contributing

感谢你愿意参与 GUNDAM Archive。这个项目同时接受**内容考据**与**工程**贡献，但两者的门槛不同：内容必须可追溯，代码必须可构建。

## 1. 环境

- Node.js ≥ 20.9（推荐 22）
- pnpm（推荐）或 npm
- 可选：Python 3（仅 `pnpm preview` 静态预览）

```bash
git clone https://github.com/cxy2696/GUNDAM-archive.git
cd GUNDAM-archive
pnpm install
pnpm dev
```

## 2. 命令

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 开发服务器 |
| `pnpm validate` | schema + 外键 + 谱系 DAG + 双向关联 |
| `pnpm docs:check` | 所有 Markdown 本地链接可解析 |
| `pnpm language:check` | 扫描模板句、AI 腔与过长段落 |
| `pnpm typecheck` | TypeScript |
| `pnpm build` | 静态导出到 `out/`（先自动生成检索索引） |
| `pnpm links:check` | 构建后校验所有站内链接与 `#fragment` |
| `pnpm routes:check` | 构建后校验 sitemap 中每条路由都有可打开的 HTML |
| `pnpm check` | 上述内容、文档、类型、语言、构建、链接、路由门禁串联 |
| `pnpm preview` | 本地预览 `out/`（python3） |

提交前至少运行 `pnpm check`；若只改文档，可先跑 `pnpm docs:check && pnpm language:check`。

## 3. 代码贡献

- 语言：TypeScript strict；不使用 `any` 逃避类型（查看器三方 ref 可用 `any` 并注释）。
- 组件：默认 Server Component；需要状态/浏览器 API 才加 `"use client"`。
- 内容读取只能在服务端（`src/lib/content.ts`）；客户端只接收纯数据。
- 样式：使用 `src/app/globals.css` 的 Token 与 `src/styles/` 的类；不要引入第二套设计系统。
- 双语文案：新增 UI 文案必须同时补 `src/lib/i18n.ts` 的 `zh` 与 `ja`；语言切换不得丢失 path / query / hash。
- 文档：字段表只在 `docs/DATA_DICTIONARY.md` 维护；改 schema 先改字段表，再改指南。文档索引与权威边界见 `docs/README.md`。
- 提交信息：Conventional Commits

```
feat(viewer): add orthographic camera preset
fix(content): correct RX-78-2 thrust source
docs(governance): clarify B-level source usage
chore(ci): cache pnpm store
```

- 不提交 `node_modules/`、`.next/`、`out/`、`.DS_Store`。
- 不引入官方美术、模型、扫描设定集。

## 4. 内容贡献

先读：

- [docs/MACHINE_COVERAGE.md](docs/MACHINE_COVERAGE.md)：判断这台机体该不该单列，还是并到本体页
- [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md)：具体填写步骤
- [docs/DATA_DICTIONARY.md](docs/DATA_DICTIONARY.md)：字段与枚举
- [docs/GOVERNANCE.md](docs/GOVERNANCE.md)：出处分级与版权边界
- [docs/EDITORIAL.md](docs/EDITORIAL.md)：语言风格、禁用模板句与长度规则

最低要求：

1. 每条参数/谱系边有 `sources`；
2. 缺失参数留 `null`，不估算；
3. 驾驶员/事件/人物双向回指；
4. 中日文本的型号、数值、年份一致；
5. `pnpm validate` 通过；
6. 同步 `docs/MACHINE_COVERAGE.md` 与 `docs/CHRONOLOGY.md` 的计数；
7. PR 附出处与页面截图。

## 5. Pull Request

PR 描述请包含：

- 变更类型（feat / fix / content / docs / chore）
- 影响的条目与页面
- 出处（作品集数、设定集页码、官方 URL）
- 截图（机体页含 3D、参数、谱系；移动端如涉及布局）
- 已知限制/待核项

Review 关注：

- 事实与出处，而不是“看起来像”；
- 数据是否破坏谱系 DAG 或双向关联；
- 双语是否一致；
- 是否引入官方素材或第三方数据库内容；
- 性能预算（首屏 JS、3D 资产体积）。

## 6. 本地截图（可选）

项目不强制提交截图工具。维护者使用 Chrome DevTools Protocol 或 Playwright 生成 `preview/` 图片；截图应保持 1440px 宽（移动端 390px），不裁剪关键 UI。

## 7. 行为准则

- 对事不对人；考据分歧用出处说话。
- 不发布剧透警告之外的攻击性内容。
- 不冒充官方；所有页面保留非官方声明。
- 发现版权问题优先开 issue，不自行下线他人内容。

## 8. License

提交即表示你同意：

- 代码以 MIT 许可；
- 原创文本/图表以 CC BY-NC-SA 4.0 许可；
- 你拥有提交内容的权利，或已获得授权。
