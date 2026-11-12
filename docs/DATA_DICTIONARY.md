# 数据字典

> 代码中的唯一真相源是 `src/lib/schema.ts`。本文是给人读的镜像；两者冲突时以 schema 为准。

## 0. 通用约定

| 约定 | 说明 |
| --- | --- |
| ID | 小写 slug：`^[a-z0-9]+(?:-[a-z0-9]+)*$`，2–64 字符。作为文件名、URL 与外键 |
| 多语言 | `Localized = { zh: string; ja: string }`；`LocalizedOptional = { zh: string; ja?: string }` |
| 时间 | 剧内相对年 + 月/日 + `precision`；不存绝对时间戳 |
| 单位 | 米、吨、千瓦、千克力（kgf）、米 |
| 出处 | `SourceRef[]`，每项含 `label`、`level`（S/A/B/C）、可选 `url` / `note` |
| 空值 | 没有数据用 `null` 或省略字段；禁止 0 或估算值 |
| 公共字段 | 多数实体有 `sources`；机体额外有 `disputed`、`dataQuality`、`updatedAt` |
| 出处覆盖 | **当前只有 Machine 与 Event 强制 `sources`**；Faction / Character / Work / Place / Tag 尚未逐条挂 `source_refs`，以作品/纪元锚定（M4 补全） |
| UI 语言 | 界面语言由路由 `/zh` / `/ja` 决定，不写入内容字段；`Localized` 只描述数据本身 |

## 1. 枚举

### CanonLevel

| 值 | 含义 |
| --- | --- |
| `mainline` | 正史主线 |
| `side_story` | 外传 |
| `parallel` | 平行世界 / 其他纪元 |
| `game_original` | 游戏原创 |

### UnitType

`prototype` 试作机 · `mass_production` 量产机 · `limited` 限量/指挥官型 · `ship` 舰船 · `mobile_armor` 机动装甲

### EdgeKind

`derive_of` 型号衍生 · `tech_from` 跨型号技术来源 · `replace` 任务替代

### ArmamentType

`beam` 光束 · `kinetic` 实弹 · `melee` 格斗 · `special` 特殊

### TagCategory

`armor` · `power` · `sensor` · `weapon` · `system` · `frame`

### EventScale

`era` 时代级 · `battle` 战役级 · `incident` 事件级

### PlaceKind

`earth` · `colony` · `space` · `moon`

### WorkType

`tv` · `ova` · `movie` · `novel` · `manga` · `game`

### CharacterStatus

`alive` · `dead` · `unknown` · `missing`

### RelationType

势力：`affiliation` 隶属 · `hostility` 敌对 · `succession` 继承 · `split` 分裂 · `alliance` 同盟  
人物：`family` 亲属 · `mentor` 师徒 · `comrade` 战友 · `rival` 宿敌 · `admiration` 仰慕

## 2. StoryDate

```ts
{
  year: number;        // 1–9999，纪元内相对年
  month?: number;      // 1–12
  day?: number;        // 1–31
  precision: "year" | "month" | "day" | "approximate";
  label?: string;      // 可选原文写法
}
```

- `year` 是纪元内年份，不是公元。U.C.0079 存 `79`，C.C.2345 存 `2345`。
- 年表位置使用 `year + (month-1)/12 + (day-1)/365` 的连续值，仅用于布局，不用于计算。
- 精度不足时不要补月日；`approximate` 用于资料只给“约 0079 年末”的情况。

## 3. Era

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | slug | ✓ | `uc` / `fc` / `ac` / `aw` / `cc` / `ce` / `ad` |
| `code` | string | ✓ | `U.C.` 等 |
| `name` | `{zh,ja,en}` | ✓ | 三语名称 |
| `order` | number | ✓ | 时间轴/泳道顺序 |
| `canon` | `mainline\|parallel` | ✓ | 主历史或平行 |
| `color` | hex | ✓ | 泳道颜色 |
| `span` | `{start,end}` | ✓ | 全史范围 |
| `window` | `{start,end}` | ✓ | 默认剧情窗口（年表聚焦） |
| `summary` | localized | ✓ | 纪元简介 |
| `note` | localized | — | 补充说明 |

U.C. 的 `span` 为 0001–0223，`window` 为 0079–0096；年表默认显示剧情窗口，可切换全史。

## 4. Machine

| 分组 | 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- | --- |
| 标识 | `id` | slug | ✓ | 同时是 URL |
| 标识 | `modelCode` | string | ✓ | `RX-78-2` 等 |
| 标识 | `name` | `{zh,ja,en}` | ✓ | 三语 |
| 标识 | `aliases` | string[] | — | 检索别名，不建重复条目 |
| 分类 | `unitType` | enum | ✓ | 试作/量产/… |
| 分类 | `eraId` | ref Era | ✓ | 主纪元 |
| 分类 | `factionId` | ref Faction | ✓ | 主阵营 |
| 分类 | `canon` | enum | ✓ | 正史层级 |
| 分类 | `firstAppear` | StoryDate | ✓ | 剧内首战/首登场 |
| 文本 | `summary` | localized | ✓ | 一句话定位 |
| 文本 | `description` | `{zh:string[],ja:string[]}` | ✓ | 段落数组，便于增量翻译 |
| 参数 | `specs.heightOverall` | number\|null | — | 全高，米 |
| 参数 | `specs.heightHead` | number\|null | — | 头顶高，米 |
| 参数 | `specs.weightEmpty` | number\|null | — | 本体重量，吨 |
| 参数 | `specs.weightFull` | number\|null | — | 全备重量，吨 |
| 参数 | `specs.powerOutput` | number\|null | — | 发电机出力，kW |
| 参数 | `specs.thrust` | number\|null | — | 推进力，kgf |
| 参数 | `specs.sensorRadius` | number\|null | — | 传感器半径，m |
| 参数 | `specs.armor` | localized\|省略 | — | 装甲材质；不要写 `null` |
| 武装 | `armament[]` | `{name,type}` | — | 名称三语，类型枚举 |
| 技术 | `tags` | tagId[] | — | 受控词表 |
| 关联 | `pilots[]` | `{characterId,note?}` | — | 双向维护 |
| 关联 | `eventIds` | eventId[] | — | 双向维护 |
| 关联 | `workIds` | workId[] | — | 登场作品 |
| 谱系 | `edges[]` | Edge | — | 见下 |
| 资产 | `viewer` | ViewerConfig | ✓ | LOD-P 占位配置 |
| 质量 | `sources` | SourceRef[] | ✓ | 至少一条 |
| 质量 | `disputed` | boolean | — | 默认 false |
| 质量 | `dataQuality` | `seed\|verified` | — | 默认 seed |
| 质量 | `updatedAt` | string | ✓ | 日期字符串 |

### Edge

```ts
{
  to: machineId;
  kind: "derive_of" | "tech_from" | "replace";
  techTag?: tagId;
  note: { zh: string; ja: string };
  sources: SourceRef[]; // 至少一条，强制
}
```

### ViewerConfig

```ts
{
  head: "vfin" | "mono" | "unicorn" | "mustache" | "fin";
  build: "standard" | "heavy" | "slim";
  shoulder: "block" | "spike" | "round" | "binder" | "wing";
  backpack: "thruster" | "funnel" | "wing" | "none";
  weapon: "rifle" | "bazooka" | "saber" | "mace" | "none";
  shield: boolean;
  colors: { primary; secondary; accent; eye; frame };
}
```

## 5. Event

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | slug | ✓ | |
| `title` | localized | ✓ | |
| `eraId` | ref | ✓ | |
| `scale` | enum | ✓ | 时代/战役/事件 |
| `date` | StoryDate | ✓ | 必填近似起点 |
| `endDate` | StoryDate | — | 跨度事件 |
| `placeId` | ref Place | — | 地图锚点 |
| `factionIds` | ref[] | — | 参战方 |
| `machineIds` | ref[] | — | 关联机体 |
| `characterIds` | ref[] | — | 关联人物 |
| `summary` | localized | ✓ | 一句话概述 |
| `detail` | `{zh:string[],ja:string[]}` | ✓ | 事件经过的长解释；至少 1 段，建议 2–4 段 |
| `outcome` | localized | ✓ | 结果 |
| `canon` | enum | ✓ | |
| `mainline` | boolean | — | 默认 true，年表“仅主线”过滤 |
| `sources` | SourceRef[] | ✓ | |

## 6. Faction

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` / `name` / `short` | slug / 三语 / string | `short` 用于徽标，≤8 字符 |
| `color` | hex | 卡片、关系线 |
| `eraIds` | ref[] | 可出现于多个纪元 |
| `parentId` | ref\|null | 组织树上级 |
| `founded` / `dissolved` | string | 纪年写法，如 `U.C.0058` |
| `description` | localized | |
| `motto` | localized | 可选 |
| `relations[]` | `{targetId,type}` | 五类横向关系 |

## 7. Character

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` / `name` | slug / 三语 | |
| `aliases` | string[] | 别名/称号，默认空 |
| `age` | localized | 年龄；标“约”的为推定 |
| `rank` | localized | 军衔 / 身份 |
| `origin` | localized | 出身地 / 殖民地 |
| `factionId` | ref | 主所属 |
| `affiliations[]` | `{factionId,period}` | 多段任期/转阵营 |
| `eraIds` | ref[] | |
| `role` | localized | 身份/职务 |
| `status` | enum | 存活/阵亡/不明/下落不明 |
| `bio` | `{zh:string[],ja:string[]}` | 分段传记 |
| `machineIds` / `eventIds` | ref[] | 双向 |
| `relations[]` | `{targetId,type}` | 人物关系 |
| `appearances` | workId[] | 登场作品 |

## 8. Work / Place / Tag

### Work

`id, title{zh,ja,en}, year, type, eraId, canon, summary{zh,ja}`。

### Place

`id, name{zh,ja}, kind, lat?, lng?, orbit?, angle?, description{zh,ja}`。

- 地球/月球用 `lat/lng`；殖民地用 `orbit`（L1–L5）+ `angle`，供示意地图投影。
- `axis` 等深空地点可省略轨道，地图会单独标注。

### Tag

`id, name{zh,ja,en}, category, description{zh,ja}, detail{zh:string[],ja:string[]}`。`description` 是一句话定义，`detail` 解释来源、机制、代价与历史作用（至少 1 段）。标签是跨纪元比较的唯一公共语言；新增前先检查是否已有同义标签。

## 9. 单位与换算

| 量 | 存储单位 | 展示 | 换算 |
| --- | --- | --- | --- |
| 长度 | m | m | 1 m = 3.28084 ft |
| 重量 | t | t | 1 t = 1000 kg |
| 出力 | kW | kW | 1 hp ≈ 0.7355 kW |
| 推力 | kgf | kgf | 1 kgf = 9.80665 N |
| 传感器 | m | m | — |

**禁止**在数据层存两份换算值。前端需要英制时在展示层换算，并标注 `converted`。

## 9.1 出处覆盖范围

当前版本的 `sources` 覆盖：

| 实体 | 是否强制 `sources` | 说明 |
| --- | --- | --- |
| Machine | 是（至少 1 条） | 参数、谱系边、描述依据 |
| Event | 是（至少 1 条） | 时间、结果、参战方依据 |
| Faction / Character / Work / Place / Tag | 否（字段未定义） | 目前通过所属作品、纪元与条目关系锚定；UI 不宣称这些条目“逐条附出处” |

这是已知差距，不是“全部条目已可溯源”。M4 的任务包括为这些实体补 `source_refs` 或在界面明确显示覆盖范围。

## 10. 交叉校验规则

`validateBundle()` 当前强制：

1. 所有实体 `id` 唯一。
2. 所有外键可解析（era / faction / character / work / place / event / tag / machine）。
3. 势力不能与自身建立关系。
4. 谱系边不能自指；忽略 `replace` 后必须无环。
5. 每条谱系边至少一条出处。
6. 机体驾驶员 ↔ 人物 `machineIds` 双向。
7. 机体事件 ↔ 事件 `machineIds` 双向。
8. 人物事件 ↔ 事件 `characterIds` 双向；
9. 每个 Tag 必须有 `detail`，每个 Event 必须有 `detail`，每个 Character 必须有 `age / rank / origin`。
9. 人物 `affiliations` 的势力必须存在。

## 11. 资产清单（预留）

未来 glTF 资产使用 `asset-manifest.json`，字段见 [ASSET_PIPELINE.md](ASSET_PIPELINE.md)：`machineSlug, version, scale, bounds, lods[], parts[], materials, animations[], designSheets[]`。当前的 `viewer` 是 LOD-P 占位；两者通过 `machineSlug` 对应。

## 12. 版本与迁移

- 内容变更以 Git 提交为版本；每次发布打 tag。
- 未来 `content_version` 快照保留历史版本，`?v=` 查询历史。
- ULID 是目标数据库主键；当前内容层用 slug 作为外键，迁移时映射，不改变 URL。

## 11.5 宇宙地图（atlas.json）

`content/atlas.json` 是数组，每项对应一个 `eraId`。字段：

`eraId, bodies, focus{lon,lat}, nodes[], routes[], geography{zh,ja}, layoutNote?, sources[]`。

`nodes[]`：`id, name{zh,ja}, kind, anchor, orbit?, angle?, lat?, lng?, distance?, factionId?, placeId?, note?, priority`。

- `anchor` 为 `earth | moon | mars | venus | jupiter | lagrange | earthorbit | deep`。
- `earth` / `moon` 必须有 `lat` / `lng`；`lagrange` 必须有 `orbit`（L1–L5）；`earthorbit` 用 `distance` + `angle` 表示未分配拉格朗日点的地球轨道；`deep` 用 `distance` + `angle` 表示远域。
- `priority` 1 = 始终标注，2 = 有空间时标注，3 = 只在列表中出现。
- `kind` 为 `capital | city | colony | station | fortress | battlefield | elevator | region | fleet`。
- 轨道距离是压缩示意；`geography` 必须写明该纪元的编制依据（如 U.C. 0084 年重编），`sources` 必填。
- 章节校验会检查：每个纪元必须有图；节点/航线引用的 faction / place 必须存在；Lagrange 节点必须有 orbit；地球/月球节点必须有经纬度。

`routes[]`：`from, to, kind(supply|invasion|migration), label?`，用于 2D/3D 的航道弧线。

