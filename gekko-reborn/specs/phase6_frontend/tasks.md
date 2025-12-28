# 实施计划 - Phase 6: Web 前端开发

## 任务列表

- [ ] **1. 项目初始化与基础架构**
  - 创建 `src` 目录结构 (`app`, `components`, `lib`, `types`, `services`)。
  - 配置 Tailwind CSS (如果尚未配置) 和全局样式。
  - 封装 `api.ts` (Axios 实例)。

- [ ] **2. 基础 UI 组件开发**
  - 实现或集成基础组件: `Card` (卡片), `Button` (按钮), `Input` (输入框), `Table` (表格)。
  - 创建应用主布局 `AppLayout` (包含侧边导航栏)。

- [ ] **3. 仪表盘 (Dashboard) 开发**
  - 定义 `Portfolio` 和 `Order` 的 TypeScript 类型。
  - 开发 `PortfolioSummary` 组件 (显示总资产)。
  - 开发 `ActiveOrders` 组件 (显示订单列表)。
  - 集成首页 API。

- [ ] **4. 市场行情 (Market) 页面开发**
  - 封装 `CandleStickChart` 组件 (基于 Lightweight Charts)。
  - 实现市场数据获取服务 `MarketService`。
  - 实现行情页面，支持切换交易对和周期。

- [ ] **5. 策略与回测 (Backtest) 页面开发**
  - 开发回测配置表单 (时间范围, 资金, 策略选择)。
  - 开发回测结果展示组件 (资金曲线图, 关键指标卡片)。
  - 集成回测 API。

- [ ] **6. AI 模型管理页面开发**
  - 开发模型列表展示组件。
  - 开发训练任务触发界面。
  - 集成 AI 相关 API。

## 需求追踪
- 需求 1 -> 任务 3
- 需求 2 -> 任务 4
- 需求 3 -> 任务 5
- 需求 4 -> 任务 6
