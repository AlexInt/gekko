# 项目介绍：KoiQuant

## 一句话说明

KoiQuant 是对经典 Gekko 的现代化重构版本（独立项目命名）：后端采用 FastAPI + 异步 SQLAlchemy，前端采用 Next.js，围绕「数据 → 策略/AI → 回测 → 交易（模拟/实盘）」构建可扩展的量化交易系统。

## 代码仓库结构

```
KoiQuant/
  backend/          # FastAPI 后端 + 策略/回测/AI
  frontend/         # Next.js 前端
  docker-compose.yml
  docs/             # 本文档
  specs/            # 需求/方案/计划（按阶段）
```

## 技术栈概览

- 后端：Python 3.11、FastAPI、Uvicorn、SQLAlchemy（Async）、Alembic、TimescaleDB/PostgreSQL、Redis（预留）、APScheduler、ccxt、Pandas/NumPy、TA-Lib、PyTorch
- 前端：Next.js App Router、TypeScript、Tailwind CSS、Radix UI、next-intl、next-themes
- 部署：docker compose（推荐）；Ubuntu 24 生产环境可直接沿用

## 核心模块（以当前实现为准）

- Market：交易所列表、K 线导入、历史 K 线查询（后端以 ccxt 为数据源，落库到 Candle 表）
- Backtest：基于历史 K 线运行策略，输出权益曲线与交易记录
- Bots：交易机器人实例管理（当前更多是“配置与状态”的雏形）
- Orders/Portfolio：订单与资产（以模拟交易为主，实盘接口预留）
- AI：特征工程 + LSTM 训练 + 模型登记（可被策略加载产生信号）
