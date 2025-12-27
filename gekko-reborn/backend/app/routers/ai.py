from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any
from pydantic import BaseModel
from sqlalchemy import select

from app.core.database import get_db
from app.ai.trainer import AITrainer
from app.models.ai_model import AIModel

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    responses={404: {"description": "Not found"}},
)

class TrainRequest(BaseModel):
    name: str
    exchange: str
    symbol: str
    timeframe: str
    start_date: str
    end_date: str
    model_type: str = "LSTM"
    feature_config: List[Dict[str, Any]]
    model_config: Dict[str, Any]

@router.post("/train")
async def train_model(request: TrainRequest, db: AsyncSession = Depends(get_db)):
    trainer = AITrainer(db)
    try:
        # 注意：这是一个耗时任务。在生产环境中，请使用 Celery。
        result = await trainer.train_model(request.model_dump())
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).order_by(AIModel.created_at.desc()))
    models = result.scalars().all()
    return [m.to_dict() for m in models]
