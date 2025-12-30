import uuid
from sqlalchemy import Column, String, Float, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exchange = Column(String, nullable=False, index=True)
    symbol = Column(String, nullable=False, index=True)
    side = Column(String, nullable=False)  # buy, sell
    type = Column(String, nullable=False)  # market, limit
    status = Column(String, nullable=False, default="pending", index=True) # pending, filled, cancelled, failed
    
    price = Column(Float, nullable=True) # Limit price
    amount = Column(Float, nullable=False) # Order amount
    
    filled_price = Column(Float, nullable=True)
    filled_amount = Column(Float, default=0.0)
    fee = Column(Float, default=0.0)
    cost = Column(Float, default=0.0)
    
    is_paper = Column(Boolean, default=True, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "exchange": self.exchange,
            "symbol": self.symbol,
            "side": self.side,
            "type": self.type,
            "status": self.status,
            "price": self.price,
            "amount": self.amount,
            "filled_price": self.filled_price,
            "filled_amount": self.filled_amount,
            "fee": self.fee,
            "cost": self.cost,
            "is_paper": self.is_paper,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
