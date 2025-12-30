# 项目命名（已定：KoiQuant）

目的：把 `/Users/moon/gekko/KoiQuant/` 独立为新项目时的命名思路落在文档里，便于回溯取舍过程与约束。此文档仅记录决策，不涉及功能改动。

## 定位假设（用于选名）

- 量化交易平台：策略框架 + 回测/模拟盘 + 实盘
- 具备 AI 模块（训练/特征工程/模型管理）但不以“纯 AI”作为唯一标签
- 前后端一体（backend + frontend），偏“产品/平台”，而不只是库

## 取名取向（先选一个方向）

1. 保留 Gekko 传承（利于现有用户理解、延续品牌记忆）
2. 完全独立品牌（更自由、更适合未来扩展和商业化/产品化）

## 我最推荐的 6 个（从更产品化到更技术化）

- **KoiQuant**
  - 特点：独立品牌强、记忆点高（Koi/锦鲤意象），同时明确指向 Quant。
  - 适合：想摆脱“Gekko 分支”观感、长期作为独立产品演进。
- **AstraQuant**
  - 特点：Astra（星辰/航行意象）+ Quant，听感更“平台/系统”。
  - 适合：强调工程化与扩展性、偏中性严肃路线。
- **NovaGekko**
  - 特点：保留 Gekko，同时 Nova（新星）表达“新项目/新阶段”。
  - 适合：希望延续 Gekko 认知，但明确这是新版本/新体系。
- **ReGekko**
  - 特点：极简直观，含义就是 Gekko Reborn。
  - 适合：仓库名短、传播成本低，但品牌独立性略弱。
- **HelioTrade**
  - 特点：Helio（太阳意象）+ Trade，整体更像“交易系统/引擎”。
  - 适合：更偏产品名、愿意弱化“量化”直指而突出交易属性。
- **QuantaGekko**
  - 特点：Quant + Gekko 的组合，直观表意。
  - 适合：需要同时兼顾“量化定位”和“Gekko 传承”。

## 更偏“开源工具/引擎”风格（技术向）

- GekkoCore
- GekkoStack
- GekkoSuite
- GekkoEngine
- VectorTrade（带一点“特征/向量/AI 工程”的暗示）

## 更偏“AI 量化”风格（强调模型/信号）

- GekkoAI
- SignalForge（信号锻造）
- AlphaMint（产出 Alpha 的隐喻）
- FeatureFlow（特征流/训练流的工程语感）

## 仓库名建议（小写/连字符风格）

以下仅作为常见仓库命名风格参考：

- novagekko / nova-gekko
- regekko / re-gekko
- koiquant / koi-quant
- astraquant / astra-quant
- heliotrade / helio-trade
- quantagekko / quanta-gekko

## 快速收敛建议（不改代码，仅辅助决策）

如果你希望“稳妥 + 低风险 + 易理解”，优先：

- **NovaGekko**（传承清晰，又能强调新项目）

如果你希望“独立品牌 + 长期空间”，优先：

- **KoiQuant**（独立性强、记忆点好、未来不受 Gekko 影子限制）
