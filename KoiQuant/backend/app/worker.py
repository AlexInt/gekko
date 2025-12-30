import os

from celery import Celery


broker_url = (
    os.getenv("CELERY_BROKER_URL")
    or os.getenv("REDIS_URL")
    or "redis://redis:6379/0"
)

app = Celery(
    "koiquant",
    broker=broker_url,
    backend=broker_url,
)


celery_app = app
