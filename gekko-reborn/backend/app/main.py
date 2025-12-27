from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.database import engine
from app.models.candle import Base
from app.core.scheduler import start_scheduler, scheduler

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
    "http://localhost:8000",
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
