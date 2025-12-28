# 命令速查（替代旧版 CLI）

旧版 Gekko 有较完整的命令行工作流。Gekko Reborn 当前阶段主要以：

- docker compose（服务编排）
- Poetry（后端依赖/运行）
- npm（前端依赖/运行）

作为“命令入口”。

## docker compose

```bash
docker compose up -d --build
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## 后端

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
poetry run pytest
```

## 前端

```bash
cd frontend
npm install
npm run dev -p 3000
npm run lint
npm run build
```

