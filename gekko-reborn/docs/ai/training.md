# AI 训练与模型管理

## 发起训练

后端接口：`POST /ai/train`

请求体包含：

- 标识信息：name/exchange/symbol/timeframe
- 时间范围：start_date/end_date
- 特征配置：feature_config
- 模型配置：configuration（会在后端映射为 model_config）

## 训练产物

训练完成后会保存：

- 模型权重（例如 `.pth`）
- scaler 与特征配置（例如 `.joblib`）
- 训练指标（accuracy/loss 等，字段以当前实现为准）

## 模型列表

后端接口：`GET /ai/models`

前端：AI 模型页会展示模型仓库列表。

## 注意事项

- 当前训练接口为了可用性，多数是同步等待训练完成；长时间训练会占用请求连接
- 后续建议把训练迁移到异步任务队列，并将状态与日志持久化

