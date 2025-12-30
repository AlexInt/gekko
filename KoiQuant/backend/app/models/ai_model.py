from sqlalchemy import Column, String, Boolean, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from datetime import datetime
import uuid

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 模型类型: LSTM, XGBoost
    version = Column(String, nullable=False)
    config = Column(JSON, nullable=False)  # 训练配置
    metrics = Column(JSON, nullable=True)  # 评估指标
    file_path = Column(String, nullable=False) # 模型文件存储路径
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "type": self.type,
            "version": self.version,
            "config": self.config,
            "metrics": self.metrics,
            "file_path": self.file_path,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }
