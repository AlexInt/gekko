from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import engine
from app.models.candle import Base
from app.core.scheduler import start_scheduler, scheduler
from app.routers import ai, orders, portfolio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and start scheduler
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    start_scheduler()
    print("Scheduler started")
    
    yield
    
    # Shutdown: Stop scheduler
    scheduler.shutdown()
    print("Scheduler stopped")

app = FastAPI(
    title="Gekko Reborn API",
    description="Backend API for AI-powered crypto trading bot",
    version="0.1.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    "http://localhost:3000",  # Next.js frontend
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://localhost:4000",
    "*" # For development convenience
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Gekko Reborn API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(ai.router)
app.include_router(orders.router)
app.include_router(portfolio.router)
