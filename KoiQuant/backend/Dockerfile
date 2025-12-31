# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG TA_LIB_VERSION=0.4.0

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends gcc make; \
    rm -rf /var/lib/apt/lists/*; \
    mkdir -p /tmp/ta-lib; \
    wget -qO /tmp/ta-lib/ta-lib.tar.gz "https://prdownloads.sourceforge.net/ta-lib/ta-lib-${TA_LIB_VERSION}-src.tar.gz"; \
    tar -xzf /tmp/ta-lib/ta-lib.tar.gz -C /tmp/ta-lib; \
    cd "/tmp/ta-lib/ta-lib"; \
    ./configure --prefix=/usr --build="$(uname -m)-unknown-linux-gnu"; \
    make -j1; \
    make install; \
    ldconfig; \
    rm -rf /tmp/ta-lib

# Install Poetry
RUN pip install poetry

# Copy only requirements to cache them in docker layer
COPY pyproject.toml poetry.lock* /app/

# Config poetry: do not create virtualenv (use system python in container)
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root

# Copy project
COPY . /app

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
