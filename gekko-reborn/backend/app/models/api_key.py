from sqlalchemy import Column, Integer, String, DateTime, Text
from app.core.database import Base
from datetime import datetime

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    exchange = Column(String, index=True, nullable=False)
    name = Column(String, nullable=True) # User friendly name
    key = Column(String, nullable=False)
    secret = Column(Text, nullable=False) # Should be encrypted
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "exchange": self.exchange,
            "name": self.name,
            "key": self.key[:4] + "..." + self.key[-4:] if len(self.key) > 8 else "***", # Masked
            "created_at": self.created_at.isoformat()
        }
