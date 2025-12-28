# 实施计划 - Phase 5

## 任务清单

- [x] 5.1 **数据库迁移**

  - 定义 `Order` 和 `Balance` 的 SQLAlchemy 模型。
  - 生成并应用 Alembic 迁移脚本。

- [x] 5.2 **实现 PortfolioManager**

  - 实现 `get_balance` (查询)。
  - 实现 `init_paper_account` (初始化模拟资金)。
  - 实现 `update_balance` (资金变动，需处理并发安全或简单的数据库事务)。

- [x] 5.3 **实现 OrderManager (Paper Trading)**

  - 实现 `create_order` 方法。
  - 实现模拟撮合逻辑：获取最新价格 -> 计算费用 -> 更新订单状态 -> 调用 PortfolioManager 结算。

- [x] 5.4 **集成验证**

  - 编写 `tests/test_paper_trading.py`，验证完整的模拟交易流程。

- [x] 5.5 **API 暴露与策略集成**
  - 实现 `/orders` 和 `/portfolio` API。
  - 在 `Scheduler` 中集成策略执行逻辑：数据拉取 -> 策略分析 -> 模拟下单。
