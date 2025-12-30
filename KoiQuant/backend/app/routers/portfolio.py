from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict
from app.core.database import get_db
from app.services.portfolio_manager import PortfolioManager
from pydantic import BaseModel

router = APIRouter(
    prefix="/portfolio",
    tags=["portfolio"]
)

class InitPortfolioRequest(BaseModel):
    exchange: str
    assets: Dict[str, float]

@router.get("/", response_model=List[dict])
async def get_portfolio(
    exchange: str = "binance", 
    is_paper: bool = True,
    db: AsyncSession = Depends(get_db)
):
    pm = PortfolioManager(db)
    balances = await pm.get_portfolio(exchange, is_paper)
    return [b.to_dict() for b in balances]

@router.post("/init")
async def init_portfolio(
    request: InitPortfolioRequest,
    db: AsyncSession = Depends(get_db)
):
    """Initialize paper trading portfolio manually"""
    pm = PortfolioManager(db)
    await pm.init_paper_account(request.exchange, request.assets)
    return {"status": "ok", "message": "Portfolio initialized"}
