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
    configuration: Dict[str, Any]

@router.post("/train")
async def train_model(
    request: TrainRequest, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Start AI model training.
    """
    trainer = AITrainer(db)
    
    # 异步执行训练 (Async execution)
    # Note: In production, passing DB session to background task is tricky 
    # because session might close. 
    # For now we await it to ensure it completes, 
    # or we should use a proper task queue.
    # Given the 'await' in trainer.train_model, this is currently blocking.
    # To make it non-blocking, we need to restructure AITrainer to update DB later.
    
    try:
        data = request.model_dump()
        data['model_config'] = data.pop('configuration')
        
        # Currently running synchronously for simplicity and immediate feedback in this prototype phase
        result = await trainer.train_model(data)
        
        return {"status": "success", "model": result}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def list_models(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).order_by(AIModel.created_at.desc()))
    models = result.scalars().all()
    return [m.to_dict() for m in models]
