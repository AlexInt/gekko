# 需求文档 - Phase 5: 实盘与模拟交易 (Live & Paper Trading)

## 介绍

本阶段旨在实现 KoiQuant 的交易执行核心，包括订单管理 (`OrderManager`)、资产组合管理 (`PortfolioManager`) 以及模拟交易 (Paper Trading) 功能。这将打通从策略信号到交易执行的闭环。

## 需求

### 需求 1 - 订单管理 (Order Management)

- **用户故事**:
  - 作为策略开发者，我希望系统能提供统一的下单接口，无论底层是真实交易所还是模拟环境，我都只需调用相同的 API。
  - 作为用户，我希望能够查询历史订单状态和成交记录。

#### 验收标准

1.  **While** 系统处于运行状态，**when** 策略发出 "买入" 或 "卖出" 信号，**the** `OrderManager` **shall** 创建一个新的订单记录，状态为 `PENDING`。
2.  **When** 订单被创建且系统处于 "Paper Trading" 模式，**the** `OrderManager` **shall** 不向交易所发送请求，而是直接进入模拟撮合流程。
3.  **When** 订单被创建且系统处于 "Live Trading" 模式，**the** `OrderManager` **shall** 通过 `ccxt` 向交易所发送真实订单 (本阶段暂不实现真实下单，仅预留接口)。
4.  **The** 系统 **shall** 支持市价单 (Market Order) 和限价单 (Limit Order)。

### 需求 2 - 模拟交易 (Paper Trading)

- **用户故事**:
  - 作为用户，我希望在投入真金白银之前，能在一个无风险的环境中验证我的 AI 策略，且模拟环境应尽可能接近真实市场（考虑滑点和手续费）。

#### 验收标准

1.  **While** 订单处于 `PENDING` 状态且为模拟模式，**when** 获取到新的市场价格（Ticker 或 Candle），**the** 系统 **shall** 判断订单是否成交。
2.  **When** 模拟市价单被处理，**the** 系统 **shall** 以当前最新价格（Close 或 Ticker Price）立即成交，并扣除预设的手续费（如 0.1%）。
3.  **When** 订单成交，**the** 系统 **shall** 更新订单状态为 `FILLED`，记录成交均价和成交数量。

### 需求 3 - 资产组合管理 (Portfolio Management)

- **用户故事**:
  - 作为用户，我希望实时看到我的账户余额和持仓变化，以便评估策略表现。

#### 验收标准

1.  **When** 系统初始化，**the** `PortfolioManager` **shall** 允许用户设置初始模拟资金（例如 10,000 USDT）。
2.  **When** 订单成交（买入），**the** `PortfolioManager` **shall** 扣除 Quote Currency (如 USDT) 并增加 Base Currency (如 BTC)。
3.  **When** 订单成交（卖出），**the** `PortfolioManager` **shall** 扣除 Base Currency 并增加 Quote Currency。
4.  **The** 系统 **shall** 防止余额不足的下单请求（风控检查）。
