from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.bot import Bot
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter(
    prefix="/bots",
    tags=["bots"],
    responses={404: {"description": "Not found"}},
)

class BotCreate(BaseModel):
    name: str
    strategy: str
    mode: str = "paper"
    exchange: str
    symbol: str
    timeframe: str = "1h"
    initial_balance: float = 1000.0

class BotResponse(BaseModel):
    id: int
    name: Optional[str]
    strategy: str
    mode: str
    exchange: str
    symbol: str
    status: str
    current_balance: float
    created_at: str

@router.get("/", response_model=List[BotResponse])
async def get_bots(db: AsyncSession = Depends(get_db)):
    stmt = select(Bot).order_by(Bot.created_at.desc())
    result = await db.execute(stmt)
    bots = result.scalars().all()
    return [b.to_dict() for b in bots]

@router.post("/", response_model=BotResponse)
async def create_bot(item: BotCreate, db: AsyncSession = Depends(get_db)):
    db_bot = Bot(
        name=item.name,
        strategy=item.strategy,
        mode=item.mode,
        exchange=item.exchange,
        symbol=item.symbol,
        timeframe=item.timeframe,
        initial_balance=item.initial_balance,
        current_balance=item.initial_balance,
        status="stopped"
    )
    db.add(db_bot)
    await db.commit()
    await db.refresh(db_bot)
    return db_bot.to_dict()

@router.post("/{bot_id}/start")
async def start_bot(bot_id: int, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    if bot.status == "running":
        return {"status": "already_running"}
        
    bot.status = "running"
    bot.started_at = datetime.utcnow()
    await db.commit()
    
    # In a real scenario, we would launch a background worker here
    # e.g. background_tasks.add_task(run_strategy, bot.id)
    
    return {"status": "started", "bot_id": bot.id}

@router.post("/{bot_id}/stop")
async def stop_bot(bot_id: int, db: AsyncSession = Depends(get_db)):
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    bot.status = "stopped"
    bot.stopped_at = datetime.utcnow()
    await db.commit()
    
    return {"status": "stopped", "bot_id": bot.id}

@router.delete("/{bot_id}")
async def delete_bot(bot_id: int, db: AsyncSession = Depends(get_db)):
    bot = await db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    
    if bot.status == "running":
        raise HTTPException(status_code=400, detail="Cannot delete running bot")
        
    await db.delete(bot)
    await db.commit()
    return {"status": "success"}
