# 实施计划 - Phase 4: AI 模块

## 任务列表

- [ ] **Task 1: 基础设施搭建**
    - [ ] 创建 `backend/app/ai` 目录及子目录结构
    - [ ] 定义 `AIModel` 数据库模型 (`backend/app/models/ai_model.py`)
    - [ ] 生成并执行 Alembic 迁移脚本
    - [ ] 需求: 需求 4

- [ ] **Task 2: 特征工程模块开发**
    - [ ] 实现 `backend/app/ai/feature_engineering.py`
    - [ ] 功能: 封装 TA-Lib 指标计算
    - [ ] 功能: 实现数据归一化 (Scaler) 和保存机制
    - [ ] 功能: 实现序列生成 (Sliding Window for LSTM)
    - [ ] 单元测试: `tests/test_feature_engineering.py`
    - [ ] 需求: 需求 1

- [ ] **Task 3: 模型架构定义**
    - [ ] 定义 `BaseModel` 抽象基类 (`backend/app/ai/models/base.py`)
    - [ ] 实现 `LSTMModel` (`backend/app/ai/models/lstm.py`)
    - [ ] 单元测试: `tests/test_models.py`
    - [ ] 需求: 需求 2

- [ ] **Task 4: 训练服务开发**
    - [ ] 实现 `backend/app/ai/trainer.py`
    - [ ] 流程: 数据加载 -> 特征处理 -> 训练 -> 评估 -> 保存
    - [ ] 实现 `backend/app/ai/service.py` (业务逻辑层)
    - [ ] 需求: 需求 2, 需求 4

- [ ] **Task 5: API 接口开发**
    - [ ] 实现 `backend/app/routers/ai.py`
    - [ ] 注册 Router 到 `main.py`
    - [ ] 接口: Train, List Models, Predict
    - [ ] 需求: 需求 4

- [ ] **Task 6: 策略集成示例**
    - [ ] 创建 `backend/app/strategy/examples/ai_strategy.py`
    - [ ] 演示如何加载模型并生成信号
    - [ ] 需求: 需求 3
