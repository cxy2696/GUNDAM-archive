# 术语表

> 给第一次读这个仓库的人。每个词只解释“在本项目里是什么意思”，不写设定百科。
>
> 读完这一页大约 5 分钟；想先看全系列，去 [CHRONOLOGY](CHRONOLOGY.md) 的“一分钟版”。
>
> **32 个技术标签的完整解释**在站内 [术语与技术词条](https://cxy2696.github.io/GUNDAM-archive/zh/glossary/)：每个词条包含来源、机制、代价与使用机体。本页只解释最容易混淆的概念。站内术语支持按 U.C.、C.E.、P.D. 等系列筛选；“人类机器师”是编辑分类，用于归并人机直连接口，不是官方术语。

## 0. 最容易混淆的 5 组概念

| 容易混 | 区别 | 在本项目里怎么用 |
| --- | --- | --- |
| **纪元 vs 作品** | 纪元是历法/世界，作品是动画/漫画/游戏 | 一台机体只属于一个 `eraId`，但可以关联多部 `workIds` |
| **机体 vs 型号 vs 变体** | 机体是具体条目，型号是编号，变体是改修/换装 | 结构差异明显的变体单列；纯换色/纯背包合并到本体 |
| **正史 vs 平行** | `mainline` / `side_story` / `parallel` / `game_original` | 界面用不同标签显示，不把平行设定当正史讲 |
| **seed vs verified** | 未逐页核对 / 已核对到具体出处 | 新条目默认 `seed`；没有参数就写 `null`，不估算 |
| **谱系边 vs 时间顺序** | 谱系是技术来源，不是“谁先出场” | `derive_of` 型号衍生、`tech_from` 技术来源、`replace` 任务替代 |

## 1. 纪元与历法

十二纪元的全史跨度、剧情窗口、作品/机体/事件数见 [CHRONOLOGY](CHRONOLOGY.md)，这里不再复制表格。

代码：U.C. 宇宙世纪、F.C. 未来世纪、A.C. 后殖民世纪、A.W. 战后世纪、C.C. 正历、C.E. 宇宙历、A.D. 公元、A.G. 先进世代、R.C. 复兴世纪、P.D. 灾后纪元、A.S. 星元；A.A. 后启示录是本站原创扩展，不计入 11 个正史纪元。

## 2. 数据字段

| 词 | 含义 |
| --- | --- |
| `canon` | 设定层级：`mainline` 正史、`side_story` 外传、`parallel` 平行、`game_original` 游戏原创 |
| `unitType` | 机体类型：试作、量产、限量/指挥官、舰船、机动装甲 |
| `dataQuality` | `seed` 未逐页核对；`verified` 已核对到具体出处 |
| `disputed` | 参数存在冲突，界面会并列显示，不强行取一个值 |
| `sources` | 出处列表；`level` S/A/B/C，S 为官方动画/设定集/官网 |
| `eraId` | 机体所属纪元；一台机体只挂一个纪元，可挂多部作品 |
| `workIds` | 机体出现的作品；与作品页、检索、档案页联动 |
| `edges` | 技术谱系边；每条边必须有 `sources` 与人类可读的 `note` |
| `mainline` | 年表是否属于该纪元主线；不等于所有作品都正史 |

## 3. 工程词

| 词 | 含义 |
| --- | --- |
| DAG | 有向无环图；技术谱系的边不能形成循环 |
| LOD-P | 程序化占位资产：用参数生成的分件模型，不是官方模型 |
| `partId` | 3D 分件、2D 设计图、hover 高亮共用的稳定标识 |
| manifest | 资产清单；记录 LOD、partId、许可、来源 |
| `seed` 数据 | 已整理但尚未逐项核对到设定集页码的内容 |
| 静态导出 | `next build` 生成 `out/`，不需要 Node 运行时 |
| Atlas | 12 纪元的宇宙地图数据（`content/atlas.json`）；2D/3D 共用节点 |
| Lagrange 点 | 地月系统的 L1–L5；殖民地归属按纪元设定，不按现实比例 |
| 关联图 | 由实体引用派生的分区图；不写进 JSON，2D/3D 共用 `GraphData` |
| `ZoomFrame` | 地图/图谱/年轮的缩放+全屏容器；全屏挂到 `body` |
| `TextZoom` | 世纪表文字缩放；只改字号，不缩放布局 |
| 检索索引 | 构建期生成、按需 fetch 的 `search-index.{zh,ja}.json` |
| 链接/路由审计 | `links:check` 查站内 href/锚点；`routes:check` 查 sitemap 导出 |

## 4. 阅读路径

- 只想看机体：[/zh/machines](https://cxy2696.github.io/GUNDAM-archive/zh/machines/)
- 想看纪年：[/zh/chronology](https://cxy2696.github.io/GUNDAM-archive/zh/chronology/) → 任一纪元年表
- 想贡献内容：[CONTENT_GUIDE](CONTENT_GUIDE.md) → [DATA_DICTIONARY](DATA_DICTIONARY.md)
- 想接资产：[ASSET_PIPELINE](ASSET_PIPELINE.md) → [DATA_SOURCES](DATA_SOURCES.md)
- 想了解边界：[GOVERNANCE](GOVERNANCE.md) → [ROADMAP](ROADMAP.md)

> 本项目只维护“可核对的主线档案”，不声称已收录 5,000+ 全衍生型号；外部索引见 [DATA_SOURCES](DATA_SOURCES.md)。部署与回滚见 [OPERATIONS](OPERATIONS.md)。
