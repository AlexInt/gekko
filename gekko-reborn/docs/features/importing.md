# 数据导入

## 目标

从交易所下载历史 K 线数据（OHLCV），统一落库，供回测/AI/策略使用。

## 交互入口

- 前端：数据管理页（导入表单）
- 后端 API：`POST /market/import`

## 后端实现要点

- 交易所适配：使用 `ccxt`（异步支持 `ccxt.async_support`）
- 落库模型：`Candle`（具体字段以模型定义为准）
- 注意事项：
  - 当前导入逻辑多数为同步等待返回结果（导入大区间会较慢）
  - 后续可迁移到任务队列或批处理作业

## API 示例

```bash
curl -X POST http://localhost:8000/market/import \
  -H 'Content-Type: application/json' \
  -d '{
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "timeframe": "1h",
    "start_date": "2023-01-01T00:00:00Z",
    "end_date": "2023-02-01T00:00:00Z"
  }'
```

