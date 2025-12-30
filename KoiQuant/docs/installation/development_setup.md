# 本地开发环境搭建

## 后端（Poetry + FastAPI）

进入后端目录：

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

数据库：

- 推荐使用 docker compose 提供的 TimescaleDB/PostgreSQL
- 或自行提供 `DATABASE_URL`（参见 `backend/alembic/env.py` 的默认值）

运行测试：

```bash
poetry run pytest
```

## 前端（Next.js）

进入前端目录：

```bash
cd frontend
npm install
npm run dev -p 3000
```

前端通过 `NEXT_PUBLIC_API_URL` 指向后端地址。

## 常见问题

### 1) TA-Lib 安装问题

后端依赖 `ta-lib`，macOS 推荐使用 Homebrew 安装：

```bash
brew install ta-lib
```

如果遇到编译/链接问题，可参考后端 README 的环境变量配置。

