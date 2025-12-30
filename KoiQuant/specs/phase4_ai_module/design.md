# 技术方案设计 - Phase 4: AI 模块

## 1. 架构概览

AI 模块将作为 Backend 的一部分，提供模型训练、管理和推理服务。
核心流程：
1.  **数据准备**: 从数据库读取 OHLCV 数据 -> `FeatureEngineer` 处理 -> 生成 Training Set。
2.  **模型训练**: `Trainer` 调用具体模型 (e.g., `LSTMModel`) 进行训练 -> 评估 -> 保存模型文件和元数据。
3.  **推理应用**: 策略 (`AIStrategy`) 加载模型 -> 实时数据输入 `FeatureEngineer` -> 模型推理 -> 生成信号。

## 2. 模块结构

```
backend/app/
├── ai/
│   ├── __init__.py
│   ├── feature_engineering.py  # 特征工程：指标计算、归一化、序列化
│   ├── trainer.py              # 训练流程控制
│   ├── models/                 # 模型定义
│   │   ├── base.py             # 抽象基类
│   │   ├── lstm.py             # PyTorch LSTM 实现
│   │   └── sklearn_model.py    # (可选) Sklearn 包装器
│   └── service.py              # AI 服务层，处理 API 请求
├── models/
│   └── ai_model.py             # 数据库模型：存储模型元数据
└── routers/
    └── ai.py                   # API 接口
```

## 3. 详细设计

### 3.1 数据库设计 (PostgreSQL)

新增 `ai_models` 表，用于记录训练好的模型信息。

| 字段名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `id` | UUID | 主键 |
| `name` | String | 模型名称 (用户自定义) |
| `type` | String | 模型类型 (e.g., "LSTM", "XGBoost") |
| `version` | String | 版本号 |
| `config` | JSON | 训练配置 (特征列表, 超参数) |
| `metrics` | JSON | 评估指标 (loss, accuracy 等) |
| `file_path` | String | 模型文件存储路径 (.pth, .joblib) |
| `is_active` | Boolean | 是否为默认/推荐模型 |
| `created_at` | DateTime | 创建时间 |

### 3.2 特征工程 (FeatureEngineer)

负责将原始 K 线数据转换为模型输入。

*   **输入**: DataFrame (OHLCV)
*   **功能**:
    *   **Technical Indicators**: 调用 `ta-lib` 计算指标 (RSI, MACD, Bollinger Bands 等)。
    *   **Normalization**: Z-Score 或 MinMax 归一化 (需保存 scaler 参数以供推理使用)。
    *   **Labeling**: 生成标签 (e.g., 未来 N 根 K 线的收益率 > 阈值 ? 1 : 0)。
    *   **Sequence Generation**: 为 LSTM 生成时间序列窗口 (Sliding Window)。

### 3.3 模型接口 (BaseModel)

所有模型需实现统一接口：

```python
class BaseAIModel(ABC):
    @abstractmethod
    def train(self, X_train, y_train, X_val, y_val, config):
        pass

    @abstractmethod
    def predict(self, X):
        pass
        
    @abstractmethod
    def save(self, path):
        pass
        
    @abstractmethod
    def load(self, path):
        pass
```

### 3.4 训练服务 (Trainer)

*   接收训练请求 (时间范围, 币对, 模型类型, 参数)。
*   获取数据 -> 特征工程 -> 划分数据集。
*   初始化模型 -> 训练 -> 评估。
*   保存模型文件 -> 写入数据库。
*   支持异步执行 (使用 Celery 或 BackgroundTasks)。

## 4. 接口设计 (API)

*   `POST /api/ai/train`: 提交训练任务
    *   Body: `{ symbol: "BTC/USDT", timeframe: "1h", model_type: "LSTM", start_date: "...", end_date: "...", config: {...} }`
*   `GET /api/ai/models`: 获取模型列表
*   `DELETE /api/ai/models/{id}`: 删除模型
*   `POST /api/ai/predict`: 测试推理
    *   Body: `{ model_id: "...", data: [...] }`

## 5. 技术栈

*   **Machine Learning**: PyTorch (Deep Learning), Scikit-learn (Traditional ML)
*   **Data Processing**: Pandas, Numpy, TA-Lib
*   **Storage**: PostgreSQL (Metadata), Local Filesystem (Model Artifacts)

## 6. 安全性与性能

*   **性能**: 推理需高效，避免阻塞主线程。LSTM 推理可考虑 ONNX Runtime 优化 (后续优化项)。
*   **存储**: 模型文件较大，需定期清理未使用的旧模型。
