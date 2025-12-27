# Gekko Reborn Backend

## 简介

Gekko Reborn 是经典 Gekko 量化交易机器人的现代化重构版本（AI Edition）。后端采用 Python 编写，利用 FastAPI 提供高性能 API，集成了机器学习（PyTorch/Scikit-learn）和现代数据处理技术。

## 技术架构

- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (TimescaleDB) with AsyncSQLAlchemy
- **ORM**: SQLAlchemy 2.0+ (Async)
- **Dependency Management**: Poetry
- **Scheduler**: APScheduler
- **Data Analysis**: Pandas, NumPy, TA-Lib
- **Machine Learning**: PyTorch, Scikit-learn
- **Testing**: Pytest, Pytest-Asyncio

## 部署与运行

### 前置要求

- Python 3.11+
- Poetry
- PostgreSQL (TimescaleDB)
- Redis (Optional, for Celery/Caching)
- TA-Lib (C Library)

### 安装依赖

1. **安装 TA-Lib (macOS)**:

   由于 TA-Lib 的 Python 绑定在 macOS 上可能遇到链接问题，推荐使用 Homebrew 安装 C 库，并建立链接：

   ```bash
   brew install ta-lib

   # 如果遇到链接错误，可以尝试建立软链接（视具体版本而定）
   mkdir -p libs
   ln -sf $(brew --prefix ta-lib)/lib/libta-lib.0.dylib libs/libta_lib.dylib
   ln -sf $(brew --prefix ta-lib)/lib/libta-lib.a libs/libta_lib.a
   ```

2. **安装 Python 依赖**:

   ```bash
   # 如果使用了上述软链接修复
   export TA_INCLUDE_PATH="$(brew --prefix ta-lib)/include"
   export TA_LIBRARY_PATH="$(pwd)/libs"

   poetry install
   ```

### 运行应用

```bash
poetry run uvicorn app.main:app --reload
```

### 运行测试

```bash
# 确保 TA-Lib 路径正确
export TA_INCLUDE_PATH="$(brew --prefix ta-lib)/include"
export TA_LIBRARY_PATH="$(pwd)/libs"

poetry run pytest
```

## 项目结构

```
backend/
├── app/
│   ├── core/           # 核心配置 (Config, DB, Scheduler)
│   ├── models/         # SQLAlchemy 模型
│   ├── services/       # 业务逻辑 (MarketService, etc.)
│   ├── strategy/       # 策略引擎 (BaseStrategy, Indicators)
│   ├── backtest/       # 回测引擎 (BacktestEngine)
│   └── main.py         # 入口文件
├── tests/              # 测试用例
├── pyproject.toml      # 依赖管理
└── poetry.lock
```
