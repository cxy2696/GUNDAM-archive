# 3D 资产与渲染管线

> 对应方案书第七章。当前 v3.1.2 仍交付 **LOD-P（程序化占位）**；本文同时定义未来 glTF LOD0 的接入契约，确保换资产不改页面代码。发布与回滚见 [OPERATIONS](OPERATIONS.md)。

## 1. LOD 规范

| LOD | 用途 | 三角面预算 | 纹理上限 | 体积目标 |
| --- | --- | --- | --- | --- |
| LOD0 | 桌面端查看器 | 8–15 万 | 4 × 2K PBR | < 6 MB (Draco) |
| LOD1 | 移动端 / 列表 | 2–4 万 | 2 × 1K | < 2 MB |
| LOD2 | 缩略图 / 谱系节点 | 3–5 千 | 1 × 512 | < 300 KB |
| LOD3 | 静态截图 | — | 1 × 2K | < 200 KB JPG |

## 2. 建模硬规范

- **坐标**：原点在脚底中心，Y 轴向上，单位米，1:1 尺度。
- **朝向**：正面朝 +Z；相机默认在 +Z 侧。
- **变换**：所有 mesh apply transform；不得带非均匀缩放。
- **分件命名**：`head`、`torso`、`waist`、`shoulder_L`、`shoulder_R`、`arm_L`、`arm_R`、`leg_L`、`leg_R`、`backpack`、`weapon`、`shield`。大小写与 `PART_LABELS` 一致。
- **装配轴**：每个分件必须有自定义属性 `axis`（世界空间单位向量）与 `order`（爆炸顺序，数字越大越晚/越远）。
- **材质槽**：`primary`、`secondary`、`accent`、`eye`、`frame` 五个语义槽；具体颜色由 manifest 的 `materials` 提供。
- **UV/法线**：法线与 UV 不重叠；切线空间一致；避免烘焙后再改拓扑。
- **贴花**：编号、警告标线使用独立贴花层，不为每个涂装重做一套贴图。

## 3. 材质

- 主体装甲：金属度 0.55–0.75，粗糙度 0.3–0.45；白色装甲不要做成镜面。
- 关节/管线：金属度 0.85–0.95，粗糙度 0.25–0.35。
- 喷口内壁：自发光贴图 + emissive。
- 纹理通道：baseColor / metallicRoughness / normal / AO / emissive，统一 KTX2（BasisU）。
- 环境反射：程序化暗色环境（四点布光 + 冷调补光），不依赖外部 HDR 大文件。
- 描边由渲染器实时绘制（法线外扩 / Edges），不烘焙进贴图。

## 4. 量子形态

四通道，强度 0–1 连续插值，不改几何：

| 通道 | 实现 | 当前 LOD-P 对应 |
| --- | --- | --- |
| 粒子解构 | GPU 粒子 + 顶点噪声位移 | `QuantumParticles` + 装甲 emissive 着色 |
| 能量环路 | 多层 UV 流动 + 加色 | `QuantumRings` 环绕环 |
| 色相偏移 | 后处理分级 / 边缘色散 | 装甲颜色向量子青插值 |
| 时空扭曲 | 屏幕空间折射 | 预留；低端设备默认关闭 |

性能红线：量子开启后帧率不低于常态 70%；不达标自动降级到只保留色相偏移。必须在真机验证。

## 5. `asset-manifest.json`

每套资产必须带清单，缺失即 CI 失败（未来接入 `scripts/check-assets.ts` 后）。

```json
{
  "machineSlug": "rx-78-2",
  "version": "1.2.0",
  "scale": "1:1 (meters)",
  "bounds": { "x": 5.2, "y": 18.5, "z": 4.1 },
  "lods": [
    { "level": 0, "url": "l0.glb", "tris": 128400, "bytes": 5900000 },
    { "level": 1, "url": "l1.glb", "tris": 31200, "bytes": 1800000 },
    { "level": 2, "url": "l2.glb", "tris": 4200, "bytes": 260000 }
  ],
  "parts": [
    { "id": "head", "axis": [0, 1, 0], "order": 3 },
    { "id": "shoulder_L", "axis": [-1, 0.15, 0], "order": 2 }
  ],
  "materials": { "primary": "#2B4E8C", "secondary": "#D7DDE3" },
  "animations": ["idle", "deploy", "open_hatch"],
  "designSheets": [{ "kind": "line", "url": "sheet-line.svg" }]
}
```

- `animations` 必须使用受控命名：`idle`、`deploy`、`open_hatch`、`transform`。
- `designSheets.kind`：`line`（分层线稿）、`flat`（平涂）、`final`（成稿）。
- 前端不硬编码动画名，从清单按用途绑定。

示例见 [docs/templates/asset-manifest.example.json](templates/asset-manifest.example.json)。

## 6. 生产流水线（Blender → glTF）

```
Blender 场景（partId / axis / order / LOD）
        │
        ▼
pipelines/blender-export（批处理脚本）
  · 导出 LOD0/1/2 glTF + 纹理
  · 生成 asset-manifest.json
        │
        ▼
gltf-transform
  · Draco 几何压缩
  · KTX2 纹理压缩
  · 去重、剔除无引用节点、精简切线
        │
        ▼
校验
  · 面数 / 纹理尺寸 / partId 完整
  · bounds ≈ 设定高度
  · axis/order 存在且范围合理
        │
        ▼
对象存储 → CDN → machine_asset 表 / 静态清单
```

V1 仓库未包含 Blender 脚本与真实模型；流水线目录与脚本在 M4 接入。当前 `buildMech()` 是同一契约的代码实现，可作为“资产未就绪时的降级层”。

## 7. 与当前查看器的接入

1. 在 `content/machines/<id>.json` 增加 `assetManifest` 路径（未来字段）。
2. `MechStage` 读取 manifest；若 `lods[0]` 可用则 `useGLTF`，否则回退 `buildMech(viewer)`。
3. 将 GLB 的 mesh 按 `partId` 分组；复用现有的 `axis/order` 爆炸逻辑与 hover 状态。
4. 2D 设计图仍走 `designSheets`，与 GLB 的 `partId` 对齐。
5. 若资产加载失败，自动回退 LOD-P，并在 HUD 显示 `LOD-P FALLBACK`。

因为 `partId`、`axis`、`order` 与颜色槽在 V1 已经固定，接入真实资产是**替换数据源**，不是重写查看器。

## 8. 验收清单

- [ ] 1:1 尺度，脚底原点，Y-up
- [ ] partId 命名完整，无多余分组
- [ ] 每个分件有 axis / order
- [ ] LOD0 面数与体积达标
- [ ] KTX2 纹理可被浏览器解码
- [ ] Draco 解码器按需加载
- [ ] manifest 的 bounds 与模型一致
- [ ] 移动端 LOD1 自动切换
- [ ] 量子形态帧率 ≥ 常态 70%
- [ ] `prefers-reduced-motion` 下关闭待机动画

## 9. 版权

不得使用官方模型、扫描件或他人提取的资产。V1 的程序化几何与未来资产均应为自制或明确授权；2D 设计图标注“同人绘制，非官方设定图”。详见 [GOVERNANCE.md](GOVERNANCE.md)。


## 官方设计图与外部图片

- 不把官方设计图、扫描设定集、模型包装图或他人二次上传的图片放进 `public/` 或 `content/`。
- 不热链外部 Wiki 图床；页面必须能离线构建。
- 只接受授权素材、自绘素材或明确可再使用的 CC 素材；manifest 必须包含 `license`、`credit`、`sourceUrl`。
- 未登记授权的图片不得进入构建；`pnpm validate` / review 应拒绝。
- 当前机体视觉是自绘 SVG 与程序化 LOD-P，不是官方设计图。外部索引只用于事实核对，见 [DATA_SOURCES](DATA_SOURCES.md)。
