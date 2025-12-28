# 技术方案设计 - Phase 6: Web 前端开发

## 架构概览

前端应用将基于 **Next.js 14** (App Router) 构建，采用 **TypeScript** 进行类型安全开发。样式方案使用 **Tailwind CSS**，组件库基础采用 **Shadcn/UI** (基于 Radix UI) 的设计模式（利用已有的 `class-variance-authority`, `clsx`, `lucide-react` 依赖）。

前端将作为单页应用 (SPA) 运行（尽管 Next.js 支持 SSR，但在仪表盘类应用中，客户端数据获取更为常见），通过 REST API 与 Python (FastAPI) 后端进行通信。

## 技术栈

- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **图表**: Lightweight Charts (TradingView)
- **HTTP 客户端**: Axios
- **状态管理**: React Hooks / Context (对于全局状态如用户设置)

## 目录结构

```
frontend/
├── src/
│   ├── app/                # Next.js App Router 页面
│   │   ├── layout.tsx      # 全局布局 (导航栏等)
│   │   ├── page.tsx        # 仪表盘首页
│   │   ├── market/         # 市场行情页
│   │   ├── strategies/     # 策略与回测页
│   │   ├── ai/             # AI 模型管理页
│   │   └── settings/       # 设置页
│   ├── components/         # UI 组件
│   │   ├── ui/             # 基础组件 (Button, Card, Input...)
│   │   ├── charts/         # 图表封装组件
│   │   └── layout/         # 布局组件 (Sidebar, Navbar)
│   ├── lib/                # 工具库
│   │   ├── api.ts          # Axios 实例与拦截器
│   │   └── utils.ts        # 通用辅助函数
│   ├── services/           # API 服务调用封装
│   └── types/              # TypeScript 类型定义 (对应后端模型)
```

## 接口设计 (对应后端)

前端将封装以下 API 服务：

1.  **MarketService**:
    - `GET /api/market/candles`: 获取 K 线数据
    - `GET /api/market/status`: 获取市场状态

2.  **StrategyService**:
    - `GET /api/strategies`: 获取可用策略列表
    - `POST /api/backtest/run`: 运行回测
    - `GET /api/backtest/results/{id}`: 获取回测结果

3.  **AIService**:
    - `GET /api/ai/models`: 获取模型列表
    - `POST /api/ai/train`: 训练模型
    - `GET /api/ai/prediction`: 获取预测

4.  **PortfolioService**:
    - `GET /api/portfolio`: 获取资产组合
    - `GET /api/orders`: 获取订单列表

## UI/UX 设计

- **整体风格**: 深色模式 (Dark Mode) 默认，适合交易界面。
- **响应式**: 适配桌面端为主，兼顾平板。
- **交互**:
    - 侧边栏导航。
    - 关键操作（如交易、回测）需二次确认或状态反馈。
    - 图表支持缩放和平移。
