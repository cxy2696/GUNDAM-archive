# 运营手册

> 面向维护者与发布者，回答“怎么跑、怎么发、怎么查、怎么回滚”。  
> 内容字段见 [DATA_DICTIONARY](DATA_DICTIONARY.md)，架构见 [ARCHITECTURE](ARCHITECTURE.md)，文档规则见 [docs/README](README.md)。

## 1. 线上拓扑

| 项 | 值 |
| --- | --- |
| 站点 | GitHub Pages 项目页 |
| 中文 | https://cxy2696.github.io/GUNDAM-archive/zh/ |
| 日文 | https://cxy2696.github.io/GUNDAM-archive/ja/ |
| 仓库 | https://github.com/cxy2696/GUNDAM-archive |
| 部署分支 | `main` |
| 构建方式 | `next build` + `output: "export"` → `out/` |
| 子路径 | `NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive` |
| CI | `.github/workflows/ci.yml`：校验、类型、语言、构建、链接、路由 |
| 部署 | `.github/workflows/deploy-pages.yml`：同样的门禁 + Pages 上传与发布 |

站点没有后端、数据库或管理后台；所有更新都是 **改内容/代码 → 校验 → 构建 → 推送 → GitHub Actions 发布**。

## 2. 发布流程

```bash
# 1. 本地修改内容或代码
pnpm dev                  # 预览（会自动生成检索索引）

# 2. 提交前跑完整门禁
pnpm check                # validate → docs → typecheck → language → build → links → routes

# 3. 提交并推送
git add -A
git commit -m "feat(content): ..."
git push origin main
```

推送后：

1. **CI** 先跑一遍同样的门禁；
2. **Deploy GitHub Pages** 用 `NEXT_PUBLIC_BASE_PATH` 构建，审计链接与路由，再上传 `out/`；
3. 两个 workflow 都成功，线上才会更新。

发布后做 3 条 smoke check：

```bash
curl -sI https://cxy2696.github.io/GUNDAM-archive/zh/ | head -1
curl -sI https://cxy2696.github.io/GUNDAM-archive/zh/map/ | head -1
curl -s https://cxy2696.github.io/GUNDAM-archive/search-index.zh.json | python3 -c "import json,sys;print(len(json.load(sys.stdin)))"
```

预期：前两条为 `200`，索引条数等于当前检索条目数（当前 487）。

## 3. 本地环境

- Node.js **22**（`.nvmrc`），最低 20.9；
- pnpm **10**（与 `pnpm-lock.yaml` 的 lockfile 9.0 匹配）；没有 pnpm 时可用 npm 运行同名脚本；
- 可选 Python 3（`pnpm preview` 的静态服务器）。

```bash
pnpm install
pnpm dev                  # predev 会生成 public/search-index.{zh,ja}.json
pnpm build                # prebuild 会重新生成索引
pnpm preview              # python3 -m http.server 4173 --directory out
```

子路径本地验证：

```bash
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive NEXT_PUBLIC_SITE_URL=https://cxy2696.github.io/GUNDAM-archive pnpm build
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive pnpm links:check
NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive pnpm routes:check
```

本地预览子路径时需要把 `out/` 挂到 `/GUNDAM-archive` 路径下，或使用支持 rewrite 的静态服务器；根路径预览用普通 `pnpm preview` 即可。

## 4. 内容运营

| 操作 | 文件 | 必做校验 |
| --- | --- | --- |
| 机体 | `content/machines/*.json` | `pnpm validate`，谱系/驾驶员/事件双向回指 |
| 事件 | `content/events.json` | `sources`、`detail`、关联回指 |
| 人物 | `content/characters.json` | `age/rank/origin`、`relations` 目标存在 |
| 势力 | `content/factions.json` | `parentId`、`relations` 目标存在，每纪元 ≥5 |
| 纪元 / 地点 / 作品 / 标签 | `content/*.json` | 引用可解析；标签先入受控词表 |
| 宇宙地图 | `content/atlas.json` | 12 个纪元都有图；Lagrange 有 orbit；地表有 lat/lng |
| UI 文案 | `src/lib/i18n.ts` | 中文/日文同时补齐 |

内容改动后同步：

1. `README` / `README.ja` 的数量快照；
2. `docs/CHRONOLOGY.md` 的纪元与事件统计；
3. `docs/MACHINE_COVERAGE.md` 的覆盖表；
4. `CHANGELOG` 的下一个版本条目。

`pnpm validate` 会拒绝：重复 id、悬空外键、谱系环、非双向的驾驶员/事件关联、缺少 `detail`、缺少 `sources`。

## 5. 检索索引与缓存

- 索引由 `scripts/build-search-index.ts` 生成到 `public/search-index.{zh,ja}.json`；
- `predev` / `prebuild` 自动执行；文件已加入 `.gitignore`，不提交；
- 前端在打开检索面板或 `/search` 时按需 fetch，路径自动带 `NEXT_PUBLIC_BASE_PATH`；
- Pages/CDN 会按文件哈希与 HTTP 缓存处理静态资源；内容更新后重新构建即可。

如果线上检索为空：

1. 检查 `https://…/search-index.zh.json` 是否 200；
2. 检查构建日志是否有 `wrote public/search-index…`；
3. 本地运行 `pnpm exec tsx scripts/build-search-index.ts`；
4. 检查 `NEXT_PUBLIC_BASE_PATH` 是否与部署路径一致。

## 6. 监控

| 检查 | 频率 | 方式 |
| --- | --- | --- |
| CI / Pages 状态 | 每次 push | GitHub Actions 页面或 `gh run list` |
| 首页、地图、世纪表 | 每次发布 | `curl -I` 三条 smoke check |
| sitemap 路由 | 每次发布 | `pnpm routes:check`（CI 已跑） |
| 站内链接/锚点 | 每次发布 | `pnpm links:check`（CI 已跑） |
| 内容计数漂移 | 每次内容 PR | `pnpm docs:check`（含数量快照校验） |
| 外部来源失效 | 每月抽查 | 抽查 `sources.url`，失效则改注出处或降级 |
| 依赖安全/版本 | 每季度 | `pnpm outdated`、Dependabot/手动升级后跑 `pnpm check` |

**告警判据**：CI 红、Pages deploy 红、任一 smoke check 非 200、`links:check` / `routes:check` 失败、检索索引 404。出现任一项先停止内容合并，按第 8 节排查。

## 7. 回滚

- **单次内容回滚**：`git revert <commit>` → push；CI/Pages 自动重发。
- **整体回滚到上一个发布**：在 GitHub Actions 中找到上一次成功的 Pages run，使用 “Re-run all jobs”；或 revert 到上一个 release commit 后 push。
- **仅回滚站点、不回滚仓库**：在仓库 Settings → Pages 重新部署历史 artifact 不可用时，用上一个 commit 重新触发 workflow。
- 没有数据库迁移，无需数据回滚；内容 JSON 是唯一状态。

## 8. 排障

| 现象 | 常见原因 | 处理 |
| --- | --- | --- |
| 线上 CSS/JS 404 | base path 与部署路径不一致 | 确认 `NEXT_PUBLIC_BASE_PATH=/GUNDAM-archive`；本地复跑 base path 构建与审计 |
| 线上页面 404，构建成功 | `out/` 未包含该路由或 sitemap 路由缺失 | 跑 `pnpm routes:check`；检查 `generateStaticParams` 与 `dynamicParams` |
| 检索无结果 | 索引文件未生成 / fetch 路径错 | 检查 `public/search-index.*.json`、构建日志、base path |
| 3D 空白 | 浏览器禁用 WebGL / 无 GPU | 查看控制台；页面应保留 2D 设计图/回退文案 |
| 字体异常 | 本地字体未加载或系统回退 | 检查 `src/app/fonts/*.woff2` 与 `next/font/local` 构建日志 |
| CI 安装失败 | pnpm 版本与 lockfile 不匹配 | 使用 pnpm 10；锁定 `pnpm-lock.yaml`，不要手改 |
| build 内存不足 | 846+ 页面静态导出 | 在 CI 使用 Node 22；本地关闭其他构建；必要时拆分批次 |
| 文档检查失败 | 链接、计数或版本漂移 | 按 `docs:check` 输出修复；数量源以 `content/` 为准 |

## 9. 权限与安全

- 仓库为 public；**不要提交** `.env*`、token、私钥、官方扫描图或未授权模型；
- GitHub Actions 权限按 `.github/workflows/*.yml` 最小化（Pages 需要 `pages: write`、`id-token: write`）；
- 发布 token 只放在 GitHub Secrets / 本地凭据管理器，不写进 README 或内容 JSON；
- 外部资料只记录出处 URL 与自己的转述，不镜像官方图片；规则见 [DATA_SOURCES](DATA_SOURCES.md) 与 [GOVERNANCE](GOVERNANCE.md)。

## 10. 周期维护

- **每次发布**：`pnpm check`、三条 smoke check、更新 CHANGELOG。
- **每月**：抽查 10 条 `sources.url`；检查 README/docs 计数是否与 `content/` 一致；清理失效 issue。
- **每季度**：升级依赖并跑完整门禁；审阅 `ROADMAP` 与未完成来源覆盖；检查 Pages 配额与 Actions 用量。
- **每年**：复核许可证、NOTICE、第三方来源清单与归档策略。
