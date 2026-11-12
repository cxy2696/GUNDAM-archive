# 文档索引与维护规则

[中文](README.md) ｜ [English](README.en.md)

> 文档按“唯一职责”维护，避免同一事实在多处漂移。  
> 当前发布：v3.1.2 · 2026-11-12。第一次来先读 [CHRONOLOGY](CHRONOLOGY.md) 的一分钟版。

## 1. 权威顺序

发生冲突时，按以下顺序取信：

1. `src/lib/schema.ts` — 数据结构与构建期校验；
2. [DATA_DICTIONARY](DATA_DICTIONARY.md) — 字段、枚举、单位、Atlas 的人类可读说明；
3. [ARCHITECTURE](ARCHITECTURE.md) — 分层、数据流、部署、ADR；
4. [OPERATIONS](OPERATIONS.md) — 发布、监控、回滚、排障、周期维护；
5. 其他文档、README 与站点文案。

文档与代码/内容不一致，视为文档 bug；不要用文档“解释”一个代码没有实现的行为。

## 2. 文档地图

| 文档 | 唯一职责 | 不在这里找 |
| --- | --- | --- |
| [../README.md](../README.md) | 项目描述、能力概览、快速开始、在线入口 | 字段级定义、完整审校流程 |
| [../README.ja.md](../README.ja.md) | 日本語の概要・起動方法 | 中国語の詳細仕様 |
| [CHRONOLOGY.md](CHRONOLOGY.md) | 十二纪元世纪表、逐纪元速查、阅读顺序 | 字段定义、完整设定史 |
| [OPERATIONS.md](OPERATIONS.md) | 发布、回滚、监控、排障、权限、周期维护 | 内容写作规范、字段定义 |
| [EDITORIAL.md](EDITORIAL.md) | 编辑风格、禁用模板句、事实与长度规则 | 字段枚举、具体设定参数 |
| [MACHINE_COVERAGE.md](MACHINE_COVERAGE.md) | “全机体”的收录规则、覆盖矩阵、明确不包含什么 | 具体参数、逐条出处 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 六层模型、目录边界、数据流、查看器、部署、ADR、迁移 | 字段表、逐条内容规范 |
| [CONTENT_GUIDE.md](CONTENT_GUIDE.md) | 新增/修改机体、事件、人物、势力、作品、地图的步骤；双语与审校清单 | schema 类型定义、API 设计 |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | 字段、枚举、单位、日期、关联、Atlas、校验规则 | 操作步骤、路线图 |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Token、字体、座舱外壳、图表、动效、响应式、可访问性 | 内容事实、数据字段 |
| [ASSET_PIPELINE.md](ASSET_PIPELINE.md) | LOD、partId、manifest、Blender→glTF、验收 | 内容 JSON 字段 |
| [DATA_SOURCES.md](DATA_SOURCES.md) | 外部资料源、接入流程、官方图版权边界 | 具体机体参数、图片文件 |
| [GLOSSARY.md](GLOSSARY.md) | 纪元、字段、工程词、扩展术语的人类可读解释 | 完整字段表、完整设定史 |
| [GOVERNANCE.md](GOVERNANCE.md) | 来源分级、争议处理、版权、审核角色、AI 规则 | 技术架构、部署命令 |
| [ROADMAP.md](ROADMAP.md) | 当前版本、下一阶段、里程碑、风险 | 已发布细节（见 CHANGELOG） |
| [../CHANGELOG.md](../CHANGELOG.md) | 版本变更与修正 | 规划中的功能 |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | 开发/内容贡献流程、提交规范、PR 清单 | 内容字段的完整定义 |
| [templates/](templates/) | 可复制的机体 JSON、asset-manifest 示例 | 生产数据 |

## 3. 按问题找文档

| 我想…… | 先读 | 再读 |
| --- | --- | --- |
| 快速理解全系列 | [CHRONOLOGY](CHRONOLOGY.md) | [GLOSSARY](GLOSSARY.md) |
| 知道收了哪些机体 | [MACHINE_COVERAGE](MACHINE_COVERAGE.md) | [CHRONOLOGY](CHRONOLOGY.md) |
| 新增一台机体/事件/人物/势力 | [CONTENT_GUIDE](CONTENT_GUIDE.md) | [DATA_DICTIONARY](DATA_DICTIONARY.md) |
| 新增或修正纪元地图 | [CONTENT_GUIDE](CONTENT_GUIDE.md) 第 2.10 节 | [DATA_DICTIONARY](DATA_DICTIONARY.md) 的 Atlas |
| 改字段或校验规则 | `src/lib/schema.ts` | [DATA_DICTIONARY](DATA_DICTIONARY.md) |
| 改一段文字 | [EDITORIAL](EDITORIAL.md) | `pnpm language:check` |
| 判断出处能不能用 | [GOVERNANCE](GOVERNANCE.md) | [DATA_SOURCES](DATA_SOURCES.md) |
| 部署/回滚/排障 | [OPERATIONS](OPERATIONS.md) | `.github/workflows/` |
| 改 UI/图表 | [DESIGN_SYSTEM](DESIGN_SYSTEM.md) | [ARCHITECTURE](ARCHITECTURE.md) 的 v3.1 节 |
| 接 3D 资产 | [ASSET_PIPELINE](ASSET_PIPELINE.md) | `docs/templates/asset-manifest.example.json` |
| 看版本计划 | [ROADMAP](ROADMAP.md) | [../CHANGELOG.md](../CHANGELOG.md) |

## 4. 按角色的阅读路径

- **第一次接触**：README → ARCHITECTURE“六层模型” → 本页。
- **新增内容**：CONTENT_GUIDE → DATA_DICTIONARY → `pnpm check`。
- **改前端/查看器/图表**：DESIGN_SYSTEM → ARCHITECTURE 的 v3.1 节 → CONTRIBUTING。
- **发布/运维**：OPERATIONS → `.github/workflows/` → `pnpm check`。
- **做 3D 资产**：ASSET_PIPELINE → DATA_DICTIONARY 的 ViewerConfig → `docs/templates/asset-manifest.example.json`。
- **处理出处/版权**：GOVERNANCE → CONTENT_GUIDE → NOTICE。

## 5. 文档维护矩阵

| 变更 | 必须同步 | 校验 |
| --- | --- | --- |
| 新增/删除条目 | README/README.ja 数量快照、CHANGELOG、相关覆盖表 | `pnpm docs:check`、`pnpm validate` |
| 修改 schema 字段/枚举 | DATA_DICTIONARY、CONTENT_GUIDE、README 架构描述 | `pnpm typecheck`、`pnpm validate` |
| 修改内容数字（纪元/事件/势力/标签） | CHRONOLOGY、MACHINE_COVERAGE、README | `pnpm docs:check` |
| 新增/修改 Atlas | DATA_DICTIONARY（Atlas）、CONTENT_GUIDE 2.10、ARCHITECTURE v3.1 | `pnpm validate` |
| 修改座舱/图表/缩放 | DESIGN_SYSTEM、ARCHITECTURE v3.1 | `pnpm typecheck`、`pnpm build` |
| 修改 CI/发布/依赖 | OPERATIONS、CONTRIBUTING、README 部署表 | CI 与 Pages 实际跑通 |
| 发布新版本 | CHANGELOG、ROADMAP、README 版本、package.json | `pnpm docs:check`、CI |

## 6. 文档门禁

`pnpm docs:check` 会：

- 检查所有 Markdown 本地链接可解析；
- 检查必需文档存在（README、README.ja、CHANGELOG、CONTRIBUTING、本页、ARCHITECTURE、OPERATIONS、CONTENT_GUIDE、DATA_DICTIONARY、DESIGN_SYSTEM、ROADMAP、GOVERNANCE、EDITORIAL、CHRONOLOGY、MACHINE_COVERAGE、GLOSSARY、ASSET_PIPELINE、DATA_SOURCES）；
- 检查 package.json 版本出现在 README 与 CHANGELOG；
- 用 `content/` 的真实数量校验 README 的快照（机体/纪元/人物/作品/事件/势力/标签/谱系边/地图节点）；
- 检查 README/README.ja 没有重复章节标题；
- 检查文档索引包含 OPERATIONS 链接。

构建后还会运行 `links:check` 与 `routes:check`；完整门禁是 `pnpm check`。文档里出现的命令必须能在当前仓库直接运行。

## 7. 更新规则

1. **Schema 先行**：新增字段先改 `src/lib/schema.ts`，再改内容与 DATA_DICTIONARY。
2. **字段表只放一处**：Machine、Event、Faction、Atlas 等字段表只在 DATA_DICTIONARY 维护；README、ARCHITECTURE、CONTENT_GUIDE 只链接。
3. **路由清单只放一处**：URL 与页面职责在 ARCHITECTURE 维护；README 只列入入口。
4. **示例必须可运行**：文档里的命令、JSON、路径要在当前仓库成立；提交前跑一次 `pnpm check`。
5. **历史不重复**：已发布细节写进 CHANGELOG；ROADMAP 只保留摘要与下一阶段。
