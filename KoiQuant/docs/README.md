# KoiQuant 文档中心

本目录是 KoiQuant 的产品/使用/运维/架构文档集合，面向当前代码仓库（`backend/` + `frontend/` + `docker-compose.yml`）。

如果你来自旧版 Gekko（`gekko-die`），可以把这里理解为对其 `docs/` 的现代化对应：目录结构保持相近，但内容以 **KoiQuant 的实际实现** 为准。

## 快速入口

- 介绍
  - [项目介绍](./introduction/about_koiquant.md)
  - [范围与边界](./introduction/scope.md)
  - [路线图](./introduction/roadmap.md)
- 安装与部署
  - [使用 docker compose 部署](./installation/using_docker_compose.md)
  - [本地开发环境搭建](./installation/development_setup.md)
- 功能说明
  - [数据导入](./features/importing.md)
  - [回测](./features/backtesting.md)
  - [模拟交易（Paper Trading）](./features/paper_trading.md)
  - [实盘交易（规划中）](./features/live_trading.md)
- AI 模块
  - [AI 模块概览](./ai/overview.md)
  - [训练与模型管理](./ai/training.md)
- 策略
  - [策略简介](./strategies/introduction.md)
  - [如何编写策略](./strategies/creating_a_strategy.md)
- 研发与运维
  - [系统架构](./internals/architecture.md)
  - [后端 API（路由概览）](./internals/server_api.md)
  - [命令速查（替代旧版 CLI）](./commandline/about.md)

## 现有专题文档（仓库已有）

以下文件为历史产出，信息仍有参考价值，但可能包含阶段性结论：

- [architecture-comparison.md](./architecture-comparison.md)
- [ai_quant_frontend_gap_analysis.md](./ai_quant_frontend_gap_analysis.md)
- [ai_integration_and_live_trading_design.md](./ai_integration_and_live_trading_design.md)
- [progress_report.md](./progress_report.md)
