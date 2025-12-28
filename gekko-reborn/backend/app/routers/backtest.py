from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.market_service import MarketService
from app.backtest.engine import BacktestEngine
from app.strategy.examples.golden_cross import GoldenCrossStrategy
from app.strategy.examples.ai_strategy import AIStrategy
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import pandas as pd

router = APIRouter(
    prefix="/backtest",
    tags=["backtest"],
    responses={404: {"description": "Not found"}},
)

class BacktestRequest(BaseModel):
    strategy_id: str
    exchange: str
    symbol: str
    timeframe: str = "1h"
    start_date: datetime
    end_date: datetime
    parameters: Dict[str, Any] = {}
    initial_capital: float = 10000.0

class Trade(BaseModel):
    type: str
    price: float
    amount: float
    timestamp: datetime
    cost: Optional[float] = None
    revenue: Optional[float] = None
    fee: Optional[float] = None

class BacktestResult(BaseModel):
    total_return: float
    max_drawdown: float
    win_rate: Optional[float]
    trades_count: int
    final_equity: float
    equity_curve: List[Dict[str, Any]]
    trades: List[Trade]

@router.post("/run", response_model=BacktestResult)
async def run_backtest(req: BacktestRequest, db: AsyncSession = Depends(get_db)):
    market_service = MarketService(db)
    
    # 1. Fetch Historical Data
    df = await market_service.get_historical_candles(
        req.exchange, req.symbol, req.timeframe, req.start_date, req.end_date
    )
    
    if df.empty:
        raise HTTPException(status_code=404, detail="No historical data found for specified range")
        
    # 2. Initialize Strategy
    strategy = None
    if req.strategy_id == "golden_cross":
        strategy = GoldenCrossStrategy(req.parameters)
    elif req.strategy_id == "lstm_prediction" or req.strategy_id == "ai_strategy":
        strategy = AIStrategy(req.parameters)
    else:
        # Fallback or error
        raise HTTPException(status_code=400, detail=f"Strategy {req.strategy_id} not supported")
        
    # 3. Run Backtest
    engine = BacktestEngine(strategy, initial_capital=req.initial_capital)
    results = engine.run(df)
    
    if "error" in results:
        raise HTTPException(status_code=400, detail=results["error"])
        
    # 4. Format Result for Response
    # Convert numpy types to python types for JSON serialization
    return {
        "total_return": float(results["total_return"]),
        "max_drawdown": float(results.get("max_drawdown", 0.0)),
        "win_rate": 0.0, # TODO: Calculate win rate
        "trades_count": len(results.get("trades", [])),
        "final_equity": float(results["final_equity"]),
        "equity_curve": results.get("equity_curve", []),
        "trades": results.get("trades", [])
    }
