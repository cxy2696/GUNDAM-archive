# 内容生产指南

> 面向内容编辑、考据贡献者与 Review 者。工程实现见 [ARCHITECTURE.md](ARCHITECTURE.md)，字段逐项定义见 [DATA_DICTIONARY.md](DATA_DICTIONARY.md)。

## 0. 三条硬规则

1. **参数、谱系边、事件没有出处，不进生产数据。** 它们必须能回答“从哪知道的”。势力、人物、作品、地点、标签当前以作品/纪元锚定，尚未逐条挂 `source_refs`（M4 补全）；新增条目至少要标明所属作品，不能凭印象写。
2. **缺失即缺失。** 没有参数就写 `null`，界面显示“资料未载”；禁止用同类机体估算。
3. **有争议就并列。** 不把某一种说法包装成唯一定论；标 `disputed: true`，在 `sources` 中列出双方依据。

## 0.1 先判断：它该单列，还是并到本体页？

在动手写 JSON 前，先对照 [MACHINE_COVERAGE](MACHINE_COVERAGE.md) 的收录规则：

- **单列**：结构、定位或剧情意义明显不同（例如强袭 → 漆黑强袭、巴巴托斯 → 狼王 → 狼王·帝王）。
- **不单列**：纯换色、纯背包替换、同一台机体的不同涂装；优先补到本体页的 `armament`、`description` 或 `viewer`。
- **不收**：没有正式名称的背景机体、纯 SD／Build 跨作品机体、没有可核对线索的传闻机。

如果拿不准，先开 issue 说明“它和哪台机体是什么关系”，再决定。**宁可少一个条目，也不要造一个无法追溯的条目。**

## 1. 文件地图

| 想新增/修改 | 文件 | 备注 |
| --- | --- | --- |
| 机体 | `content/machines/<slug>.json` | 一台一个文件，PR 冲突小 |
| 事件 | `content/events.json` | 时代级 / 战役级 / 事件级 |
| 势力 | `content/factions.json` | 支持 `parentId` 组织树 |
| 人物 | `content/characters.json` | 多段所属用 `affiliations` |
| 作品 | `content/works.json` | 动画 / OVA / 剧场版 / 小说 / 漫画 / 游戏 |
| 地点 | `content/places.json` | 地球坐标或拉格朗日点 |
| 技术标签 | `content/tags.json` | 受控词表，先加标签再用 |
| 纪元 | `content/eras.json` | 注册表，含 `span` / `window` |

## 2. 新增一台机体（10 分钟）

### 2.1 复制模板

```bash
cp docs/templates/machine.template.json content/machines/my-machine.json
```

把 `id` 改成唯一的 slug（小写字母、数字、连字符），例如 `ms-14a-gelgoog`。`id` 同时是 URL，发布后不要改；如需改，先加重定向。

### 2.2 填标识与文本

```json
{
  "name": { "zh": "勇士", "ja": "ゲルググ", "en": "Gelgoog" },
  "modelCode": "MS-14A",
  "aliases": ["格鲁古古", "Gelgoog", "ゲルググ"],
  "summary": {
    "zh": "一句话定位，不超过 60 字，说明它在技术史中的位置。",
    "ja": "一行の定位。技術史の中での位置を示す。"
  }
}
```

- 中文是**重写**，不是逐句翻译日文；日文原名与官方术语保留原始写法。
- 别名只放真实存在的写法（中译、俗称、罗马字、型号变体），不要自造。
- `summary` 会出现在卡片、检索和页头，必须能独立成立。

### 2.3 填参数

```json
"specs": {
  "heightOverall": 19.2,
  "heightHead": 18.0,
  "weightEmpty": 42.1,
  "weightFull": 73.3,
  "powerOutput": 1440,
  "thrust": 61500,
  "sensorRadius": 6300,
  "armor": { "zh": "超硬钢合金", "ja": "超硬鋼合金" }
}
```

单位固定：米、吨、千瓦、千克力、米。没有的字段写 `null` 或直接省略；**不要写 0**，0 会被对比图误读。

### 2.4 填武装与标签

武装类型只能是 `beam` / `kinetic` / `melee` / `special`。标签必须来自 `content/tags.json`；没有合适的标签，先提案新增（附定义与出处），不要塞自由文本。

### 2.4.1 事件、人物与技术词条的“长解释”

除了一句话摘要，以下字段现在是必填：

- **Event**：`detail` 至少 1 段，写清背景、经过与影响；事件页会完整展开。
- **Character**：`age`、`rank`、`origin` 必填；没有可靠资料时写“不详”，不要编造。
- **Tag**：`detail` 至少 1 段，解释技术来源、机制、代价与历史作用；术语页会展示。

### 2.5 关联驾驶员、事件、作品

```json
"pilots": [{ "characterId": "amuro-ray", "note": { "zh": "主要驾驶员", "ja": "主パイロット" } }],
"eventIds": ["one-year-war"],
"workIds": ["msg-1979"]
```

**双向回指是强制的**：机体写了驾驶员，人物档案的 `machineIds` 必须包含这台机体；机体写了事件，事件的 `machineIds` 必须包含这台机体；人物写了事件同理。校验器会报错。

### 2.6 谱系边

```json
"edges": [
  {
    "to": "ms-14b-gelgoog-high-mobility",
    "kind": "derive_of",
    "techTag": "movable-frame",
    "note": { "zh": "在 A 型基础上强化推进器与关节。", "ja": "A型を基にスラスターと関節を強化。" },
    "sources": [{ "label": "《机动战士高达》MSV 设定资料", "level": "A" }]
  }
]
```

- `derive_of`：型号衍生 / 改进。
- `tech_from`：跨型号技术来源；建议带 `techTag`。
- `replace`：任务替代；不参与无环检查。
- 每条边必须有 `sources`，否则 schema 直接拒绝。
- 边是**有向**的：`from` 是当前文件，`to` 是目标。不要重复建反向边，除非语义确实不同。

### 2.7 查看器配置（程序化占位）

```json
"viewer": {
  "head": "vfin",
  "build": "standard",
  "shoulder": "block",
  "backpack": "thruster",
  "weapon": "rifle",
  "shield": true,
  "colors": { "primary": "#E8EDF2", "secondary": "#2B4E8C", "accent": "#E0B64A", "eye": "#7DE3FF", "frame": "#4A5563" }
}
```

这是 LOD-P 占位参数，不是最终模型。`head`：`vfin` / `mono` / `unicorn` / `mustache` / `fin`；`shoulder`：`block` / `spike` / `round` / `binder` / `wing`；`backpack`：`thruster` / `funnel` / `wing` / `none`；`weapon`：`rifle` / `bazooka` / `saber` / `mace` / `none`。接 glTF 后由 manifest 驱动，这些字段可保留为降级配置。

### 2.8 出处与状态

```json
"sources": [
  { "label": "TV 动画《机动战士高达》第 1—43 话", "level": "S" },
  { "label": "Gundam.INFO 官方机体页", "level": "A", "url": "https://www.gundam.info/" }
],
"disputed": false,
"dataQuality": "seed",
"updatedAt": "2026-11-11"
```

`dataQuality` 只能是 `seed` 或 `verified`。`verified` 表示已逐项核对到具体出处；新条目一律先 `seed`。

### 2.9 校验

```bash
pnpm validate
pnpm typecheck
pnpm build
```

校验通过后再开 PR。若只改文本，至少跑 `validate`。

## 3. 新增事件

1. 在 `content/events.json` 加对象，`id` 唯一。
2. `date` 使用 `{ year, month?, day?, precision }`；`precision` 为 `year|month|day|approximate`。
3. `scale` 只能是 `era|battle|incident`。
4. `placeId` 必须存在于 `places.json`。
5. `factionIds` / `machineIds` / `characterIds` 必须存在，且相关条目要回指。
6. `sources` 至少一条。

事件时间会同时进入年表与相关机体/人物/势力页；不要把“一年战争”这种时代级事件与“某次遭遇战”混在同一粒度。

## 4. 新增人物

- `factionId` 是主所属；转阵营用 `affiliations` 记录时间段。
- `bio` 中英日分开；中文与日文各至少一段。
- `machineIds` 与机体的 `pilots` 双向维护。
- `relations` 只收录明确设定：亲属、师徒、战友、宿敌、仰慕。不要用“看起来关系很好”推断。
- `status`：`alive|dead|unknown|missing`；UC 中“下落不明”用 `missing`，不要写 `dead`。

## 5. 新增势力

- `parentId` 表示组织树上下级；`relations` 表示横向关系。
- 关系类型：`affiliation|hostility|succession|split|alliance`。
- 一个势力可以同时与多个势力保持不同类型的关系；不要用一条边表达两种语义。
- `short` 是徽标缩写，最多 8 字符；`color` 用于卡片与关系线。

## 6. 新增作品

- `type`：`tv|ova|movie|novel|manga|game`。
- `eraId` 决定它出现在哪条纪元泳道。
- `canon`：`mainline|side_story|parallel|game_original`。
- 作品是设定差异的锚点：同一参数在不同作品中冲突时，在 `disputed` + `sources` 中说明，不要删掉其中一方。

## 7. 双语规则

| 规则 | 说明 |
| --- | --- |
| 术语表先行 | 机体名、势力名、技术词以 `content/tags.json` 与现有条目为准 |
| 中文重写 | 基于日文原始资料重写，不逐句直译 |
| 日文原名 | 官方写法，不自行简化或音译 |
| 数值一致 | 中日文本中的型号、年份、数值必须完全一致 |
| 长度预算 | 固定宽度组件按最长语言预留空间；按钮/标签避免写死宽度 |
| 不冒充人工 | 机翻必须标记 `mt: true`（后续字段），当前不接受机翻稿进入 `verified` |

## 8. Review 清单

- [ ] `id` / `slug` 唯一且格式合法
- [ ] 中日名称、型号、summary 完整
- [ ] 参数单位正确，缺失为 `null`，没有估算值
- [ ] 每条谱系边有出处，且没有形成环
- [ ] 驾驶员/事件/人物双向回指
- [ ] `sources` 至少一条；争议条目已标 `disputed`
- [ ] `dataQuality` 与核对程度匹配
- [ ] `pnpm validate`、`pnpm typecheck`、`pnpm build` 通过
- [ ] PR 附页面截图（机体页需含 3D 与参数区）

## 9. 常见错误

| 报错 | 原因 | 修复 |
| --- | --- | --- |
| `machine xxx.edges.to: 引用了不存在的 id` | 目标机体未创建或 slug 拼错 | 先建目标或修正 slug |
| `谱系出现环` | A→B→A | 改方向或删除多余边 |
| `驾驶员未在 machineIds 中回指` | 只改了一侧 | 到人物档案补 `machineIds` |
| `事件未回指该机体` | 只改了机体 | 到事件补 `machineIds` |
| `Expected object, received null` | 可空字段写成了 `null`（如 `armor`） | 省略字段，不要写 `null` |
| `JSON 解析失败` | 尾逗号 / 引号 | 用编辑器 JSON 校验 |

## 10. 提交

```
feat(content): add MS-14A Gelgoog
fix(content): correct RX-78-2 thrust source
docs(content): add Gelgoog production note
```

内容 PR 请附：

1. 新增/修改的条目列表；
2. 出处截图或页码；
3. 页面截图（机体页含 3D、参数、谱系）；
4. 若涉及争议，列出各方说法。
