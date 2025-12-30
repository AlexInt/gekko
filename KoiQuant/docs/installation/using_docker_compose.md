# 使用 docker compose 部署

本文档适用于 macOS 开发机与 Ubuntu 24 服务器。

## 前置条件

- 已安装 Docker 与 docker compose

## 一键启动（开发/体验）

在仓库根目录执行：

```bash
docker compose up -d --build
```

默认会启动：

- backend: `http://localhost:8000`
- frontend: `http://localhost:3000`
- db: `localhost:5432`（TimescaleDB/PostgreSQL）
- redis: `localhost:6379`

> 注意：`docker-compose.yml` 中包含 `worker` 服务，但当前代码仓库尚未提供可直接运行的 Celery 入口（属于预留项）。如果你只需要 MVP，可先注释/移除 worker。

## 常用命令

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
```

## 环境变量说明

docker compose 默认注入：

- `DATABASE_URL`
- `REDIS_URL`
- `NEXT_PUBLIC_API_URL`

详见仓库根目录 [docker-compose.yml](../../docker-compose.yml)。

