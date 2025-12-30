from sqlalchemy import Column, Integer, String, Float, DateTime, UniqueConstraint
from app.core.database import Base
from datetime import datetime

class Candle(Base):
    __tablename__ = "candles"

    id = Column(Integer, primary_key=True, index=True)
    exchange = Column(String, index=True, nullable=False)
    symbol = Column(String, index=True, nullable=False)
    timeframe = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Unique constraint to prevent duplicate candles
    __table_args__ = (
        UniqueConstraint('exchange', 'symbol', 'timeframe', 'timestamp', name='uix_candle'),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "exchange": self.exchange,
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "timestamp": self.timestamp.isoformat(),
            "open": self.open,
            "high": self.high,
            "low": self.low,
            "close": self.close,
            "volume": self.volume
        }
