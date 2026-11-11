# 文档索引与维护规则

> 文档不是越多越好。这里定义每份文档的**唯一职责**、权威顺序，以及修改时必须同步的文件，避免同一事实在四处漂移。

## 1. 权威顺序

发生冲突时，按以下顺序取信：

1. `src/lib/schema.ts` — 代码中的结构与校验；
2. `docs/DATA_DICTIONARY.md` — 字段、枚举、单位的人类可读说明；
3. `docs/ARCHITECTURE.md` — 分层、数据流、部署与决策；
4. 其他文档与 README。

文档与代码不一致，视为文档 bug；不要用文档去“解释”一个代码没有实现的行为。

## 2. 文档地图

| 文档 | 唯一职责 | 不在这里找 |
| --- | --- | --- |
| [../README.md](../README.md) | 项目入口、在线地址、快速开始、能力概览 | 字段级定义、完整审校流程 |
| [../README.ja.md](../README.ja.md) | 日本語の概要・起動方法 | 中国語の詳細仕様 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 六层模型、目录边界、数据流、查看器、部署、ADR、迁移 | 字段表、逐条内容规范 |
| [CONTENT_GUIDE.md](CONTENT_GUIDE.md) | 新增/修改机体、事件、人物、势力、作品的步骤；双语与审校清单 | schema 类型定义、API 设计 |
| [DATA_DICTIONARY.md](DATA_DICTIONARY.md) | 字段、枚举、单位、日期、关联、校验规则 | 操作步骤、路线图 |
| [ASSET_PIPELINE.md](ASSET_PIPELINE.md) | LOD、partId、manifest、Blender→glTF、验收 | 内容 JSON 字段 |
| [GOVERNANCE.md](GOVERNANCE.md) | 来源分级、争议处理、版权、审核角色、AI 规则 | 技术架构、部署命令 |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | Token、字体、组件、动效、语言切换、可访问性 | 内容事实、数据字段 |
| [ROADMAP.md](ROADMAP.md) | M0–M5、V1.1、内容批次、风险 | 已实现能力的操作说明 |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | 开发/内容贡献流程、提交规范、PR 清单 | 内容字段的完整定义 |
| [../CHANGELOG.md](../CHANGELOG.md) | 版本变更 | 规划中的功能 |
| [templates/](templates/) | 可复制的机体 JSON、asset-manifest 示例 | 生产数据 |

## 3. 按角色的阅读路径

**第一次接触项目**

`README` → `ARCHITECTURE` 的“六层模型” → `docs/README`（本文）

**新增一台机体**

`CONTENT_GUIDE` 第 2 节 → `DATA_DICTIONARY` 的 Machine / Edge → `pnpm validate`

**改前端或查看器**

`DESIGN_SYSTEM` → `ARCHITECTURE` 的查看器与目录边界 → `CONTRIBUTING`

**做 3D 资产**

`ASSET_PIPELINE` → `DATA_DICTIONARY` 的 ViewerConfig → `docs/templates/asset-manifest.example.json`

**处理出处/版权问题**

`GOVERNANCE` → `CONTENT_GUIDE` 的双语与审校 → `NOTICE`

## 4. 更新规则

1. **Schema 先行**：新增字段先改 `src/lib/schema.ts`，再改内容与 `DATA_DICTIONARY`。
2. **字段表只放一处**：Machine、Event、Faction 等字段表只在 `DATA_DICTIONARY` 维护；README、ARCHITECTURE、CONTENT_GUIDE 只链接，不复制。
3. **路由清单只放一处**：URL 与页面职责在 `ARCHITECTURE` 维护；README 只列入口。
4. **示例必须可运行**：文档里的命令、JSON、路径要在当前仓库成立；提交前跑一次。
5. **双语文案**：站点 UI 的中日文都在 `src/lib/i18n.ts`；新增 UI 文案必须同时补 `zh` 与 `ja`，不允许只写中文。
6. **文档语言**：详细规范以中文为主；日语提供 `README.ja.md` 与站点 UI。新增日语长文前先确认维护者。
7. **版本同步**：发布时更新 `CHANGELOG`、`ROADMAP`、`package.json`、页脚版本号；不要只改其中一个。
8. **不写未实现的能力**：路线图内容必须标“计划/进行中”，不能写成现状。

## 5. 文档 Review 清单

- [ ] 与 `schema.ts` 的字段、枚举一致
- [ ] 数量（机体/纪元/事件/页面/索引）与当前构建一致
- [ ] 路径、命令、环境变量可执行
- [ ] 本地 Markdown 链接全部可解析
- [ ] 没有把“计划”写成“已实现”
- [ ] 没有重复维护字段表或路由表
- [ ] 中日文 UI 文案成对出现
- [ ] 版权与“非官方”声明未被删改

## 6. 已知的文档/实现差距

这些差距是明确记录的，不用文档话术掩盖：

- **出处覆盖**：机体与事件有 `sources`；势力、人物、作品、地点、标签尚未逐条挂 `source_refs`，目前以作品锚定。M4 补全。
- **双语平行校验**：schema 强制 `zh/ja` 字段存在，但没有自动比对中日文本中的年份/数值/型号；依赖人工二审。
- **3D 资产**：文档描述 glTF LOD0 契约，当前运行的是程序化 LOD-P；manifest 示例不等于已交付资产。
- **API/DB/Admin**：只在路线图中，仓库没有对应实现。

## 7. 文档变更流程

1. 改代码或内容；
2. 更新 `DATA_DICTIONARY`（若涉及字段）与对应指南；
3. 跑 `pnpm validate && pnpm typecheck && pnpm build`；
4. 本地链接检查（见 CONTRIBUTING）；
5. PR 描述注明“文档影响范围”；
6. 发布时更新 `CHANGELOG`。

> 文档的目标不是覆盖所有细节，而是让下一个人能在正确的地方找到唯一正确的答案。
