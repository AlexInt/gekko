from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.models.api_key import ApiKey
from pydantic import BaseModel
from typing import List

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
    responses={404: {"description": "Not found"}},
)

class ApiKeyCreate(BaseModel):
    exchange: str
    name: str
    key: str
    secret: str

class ApiKeyResponse(BaseModel):
    id: int
    exchange: str
    name: str
    key: str
    created_at: str

@router.get("/api-keys", response_model=List[ApiKeyResponse])
async def get_api_keys(db: AsyncSession = Depends(get_db)):
    stmt = select(ApiKey).order_by(ApiKey.created_at.desc())
    result = await db.execute(stmt)
    keys = result.scalars().all()
    return [k.to_dict() for k in keys]

@router.post("/api-keys", response_model=ApiKeyResponse)
async def create_api_key(item: ApiKeyCreate, db: AsyncSession = Depends(get_db)):
    # Simple check if exists
    # In real app, we should encrypt secret here
    db_key = ApiKey(
        exchange=item.exchange,
        name=item.name,
        key=item.key,
        secret=item.secret
    )
    db.add(db_key)
    await db.commit()
    await db.refresh(db_key)
    return db_key.to_dict()

@router.delete("/api-keys/{key_id}")
async def delete_api_key(key_id: int, db: AsyncSession = Depends(get_db)):
    key = await db.get(ApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API Key not found")
    
    await db.delete(key)
    await db.commit()
    return {"status": "success"}
