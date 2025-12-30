from sqlalchemy import Column, String, Float, Boolean, DateTime, Integer, UniqueConstraint
from datetime import datetime
from app.core.database import Base

class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    exchange = Column(String, nullable=False, index=True)
    asset = Column(String, nullable=False, index=True) # BTC, USDT
    free = Column(Float, default=0.0)
    locked = Column(Float, default=0.0)
    is_paper = Column(Boolean, default=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('exchange', 'asset', 'is_paper', name='uix_balance_account'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "exchange": self.exchange,
            "asset": self.asset,
            "free": self.free,
            "locked": self.locked,
            "is_paper": self.is_paper,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
