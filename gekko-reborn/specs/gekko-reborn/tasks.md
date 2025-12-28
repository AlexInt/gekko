# 实施计划 - Gekko Reborn (AI Edition)

## 任务清单

### Phase 1: 项目初始化 (Infrastructure)

- [x] 1.1 搭建 Monorepo 结构 (`frontend/` + `backend/` + `docker-compose.yml`)。
- [x] 1.2 初始化 FastAPI 后端 (Poetry, SQLAlchemy, Pydantic)。
- [x] 1.3 初始化 Next.js 前端 (TypeScript, Shadcn/UI, Axios)。
- [x] 1.4 配置 PostgreSQL (TimescaleDB) 和 Redis 容器。

### Phase 2: 市场数据模块 (Market Data)

- [x] 2.1 实现 `MarketService`，封装 `ccxt` 以支持多交易所。
- [x] 2.2 实现数据清洗与存储逻辑 (TimescaleDB Hypertable)。
- [x] 2.3 配置 `APScheduler` 定时任务：每 15 分钟拉取最新 K 线。
- [x] 2.4 编写测试：Mock 交易所 API，验证数据入库流程。

### Phase 3: 策略引擎与回测 (Strategy & Backtest)

- [x] 3.1 定义策略基类 `BaseStrategy` (Python)。
- [x] 3.2 实现向量化回测引擎 (基于 Pandas)。
- [x] 3.3 实现技术指标库 (封装 `TA-Lib` 或使用 `pandas-ta`)。
- [x] 3.4 开发一个简单的均线交叉策略 (Golden Cross) 用于验证。

### Phase 4: AI 模块 (AI/ML)

- [x] 4.1 集成 PyTorch/Scikit-learn 环境。
- [x] 4.2 实现 `ModelTrainer`: 接收 K 线数据，训练 LSTM/XGBoost 模型。
- [x] 4.3 实现 `ModelPredictor`: 加载训练好的模型进行价格预测。
- [x] 4.4 开发一个基于 AI 预测的示例策略。

### Phase 5: 实盘交易 (Live Trading)

- [x] 5.1 实现 `OrderManager`: 负责下单、撤单、查询订单状态。
- [x] 5.2 实现 `PortfolioManager`: 实时同步账户余额和持仓。
- [x] 5.3 实现 Paper Trading 模式（模拟撮合）。
- [ ] 5.4 完善日志系统，记录每一次信号和交易。

### Phase 6: Web 前端开发

- [ ] 6.1 开发 Dashboard：展示 K 线图 (Lightweight Charts) 和账户概览。
- [ ] 6.2 开发策略管理页面：启动/停止策略，查看运行日志。
- [ ] 6.3 开发回测页面：配置参数，可视化回测结果。

## 依赖关系

- Phase 2 是基础，必须最先完成。
- Phase 3 和 Phase 4 可以并行开发。
- Phase 5 依赖 Phase 2 和 Phase 3。
- Phase 6 随时可以开始，但需要后端 API 支持。
