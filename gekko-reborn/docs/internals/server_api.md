# 后端 API（路由概览）

后端入口：`backend/app/main.py`

> 以下仅列出当前路由前缀与典型端点，具体参数以代码为准。

## Health

- `GET /`：服务欢迎页
- `GET /health`：健康检查

## Market（/market）

- `GET /market/exchanges`：列出支持的交易所（ccxt）
- `POST /market/import`：导入历史 K 线数据

## Backtest（/backtest）

- `POST /backtest/run`：运行回测

## Bots（/bots）

- `GET /bots/`：机器人列表
- `POST /bots/`：创建机器人
- `POST /bots/{id}/start`：启动机器人（状态变更为主，执行链路待完善）
- `POST /bots/{id}/stop`
- `DELETE /bots/{id}`

## AI（/ai）

- `POST /ai/train`：发起训练
- `GET /ai/models`：模型列表

## Settings（/settings）

- `GET /settings/api-keys`：API Key 列表
- `POST /settings/api-keys`：新增 API Key
- `DELETE /settings/api-keys/{id}`：删除 API Key

