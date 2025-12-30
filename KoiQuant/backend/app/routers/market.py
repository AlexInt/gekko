from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.market_service import MarketService
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import ccxt

router = APIRouter(
    prefix="/market",
    tags=["market"],
    responses={404: {"description": "Not found"}},
)

class ImportRequest(BaseModel):
    exchange: str
    symbol: str
    timeframe: str = '1h'
    start_date: datetime
    end_date: datetime

class CandleResponse(BaseModel):
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float

@router.get("/exchanges")
async def get_exchanges():
    """List supported exchanges."""
    return ccxt.exchanges

@router.post("/import")
async def import_market_data(
    req: ImportRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """Start a background job to import market data."""
    service = MarketService(db)
    
    # Verify exchange exists
    try:
        await service.get_exchange(req.exchange)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Run import in background
    # Note: We need a new session for background task or careful session management
    # For simplicity here, we assume service handles it or we await it (blocking).
    # Since import can take long, we should run it in background.
    # However, passing the dependency-injected 'db' session to background task 
    # might be risky if the request context closes. 
    # For now, let's run it synchronously to ensure it works, 
    # or ideally use a proper task queue (Celery) which is in the stack but might be overkill for now.
    # Let's await it for now to give immediate feedback, or use a simple workaround.
    
    try:
        result = await service.import_historical_data(
            req.exchange, 
            req.symbol, 
            req.timeframe, 
            req.start_date, 
            req.end_date
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/candles", response_model=List[CandleResponse])
async def get_candles(
    exchange: str,
    symbol: str,
    timeframe: str,
    start: datetime,
    end: datetime,
    db: AsyncSession = Depends(get_db)
):
    service = MarketService(db)
    df = await service.get_historical_candles(exchange, symbol, timeframe, start, end)
    
    if df.empty:
        return []
        
    # Convert DataFrame to list of dicts
    records = df.to_dict('records')
    # Map 'timestamp' (which is datetime object in df from service) to response
    return records
