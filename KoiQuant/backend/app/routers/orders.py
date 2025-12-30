from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.services.order_manager import OrderManager
from app.models.order import Order
from sqlalchemy import select

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.get("/", response_model=List[dict])
async def get_orders(
    exchange: str = "binance", 
    symbol: str = "BTC/USDT", 
    is_paper: bool = True,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).where(
        Order.exchange == exchange,
        Order.symbol == symbol,
        Order.is_paper == is_paper
    ).order_by(Order.created_at.desc())
    
    result = await db.execute(stmt)
    orders = result.scalars().all()
    return [o.to_dict() for o in orders]
