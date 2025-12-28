from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from app.core.database import Base
from datetime import datetime

class Bot(Base):
    __tablename__ = "bots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    strategy = Column(String, nullable=False)
    mode = Column(String, default="paper") # paper, live
    exchange = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    timeframe = Column(String, default="1h")
    
    status = Column(String, default="stopped") # running, stopped, error
    
    initial_balance = Column(Float, default=1000.0)
    current_balance = Column(Float, default=1000.0)
    
    config = Column(Text, nullable=True) # JSON config for strategy
    
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    stopped_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "strategy": self.strategy,
            "mode": self.mode,
            "exchange": self.exchange,
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "status": self.status,
            "initial_balance": self.initial_balance,
            "current_balance": self.current_balance,
            "created_at": self.created_at.isoformat(),
            "started_at": self.started_at.isoformat() if self.started_at else None
        }
