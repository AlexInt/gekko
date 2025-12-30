import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List
import os
import uuid
import json
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.market_service import MarketService
from app.ai.feature_engineering import FeatureEngineer
from app.ai.models.lstm import LSTMModel
from app.models.ai_model import AIModel

class AITrainer:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.market_service = MarketService(db)
        
    async def train_model(self, request: Dict[str, Any]):
        """
        request: {
            "name": "我的 LSTM 模型",
            "exchange": "binance",
            "symbol": "BTC/USDT",
            "timeframe": "1h",
            "start_date": "2023-01-01",
            "end_date": "2023-12-31",
            "model_type": "LSTM",
            "feature_config": [...],
            "model_config": {...}
        }
        """
        # 1. 获取数据
        start_date = datetime.fromisoformat(request['start_date'])
        end_date = datetime.fromisoformat(request['end_date'])
        
        df = await self.market_service.get_historical_candles(
            request['exchange'], 
            request['symbol'], 
            request['timeframe'], 
            start_date, 
            end_date
        )
        
        if df.empty:
            raise ValueError(f"未找到训练数据: {request['exchange']} {request['symbol']} {request['timeframe']}")

        # 2. 特征工程
        fe = FeatureEngineer()
        df = fe.add_technical_indicators(df, request.get('feature_config', []))
        
        # 确定目标列逻辑（默认为未来收益率）
        # TODO: 允许通过 request 自定义目标逻辑
        df = fe.add_labels(df) 
        
        # 划分训练集/验证集
        # 简单的基于时间的划分
        train_size = int(len(df) * 0.8)
        train_df = df.iloc[:train_size]
        val_df = df.iloc[train_size:]
        
        if len(train_df) == 0:
             raise ValueError("处理后训练数据不足")

        # 拟合 Scaler
        # 排除非特征列
        # 注意：如果需要，我们通常也会保留 OHLCV 作为特征。
        # 目前假设除元数据和目标列之外的所有列都是特征。
        
        potential_features = [c for c in df.columns if c not in ['timestamp', 'symbol', 'exchange', 'target', 'datetime', 'id', 'created_at']]
        
        fe.fit_scaler(train_df, potential_features)
        
        # 转换 (缩放)
        train_df_scaled = fe.transform(train_df)
        val_df_scaled = fe.transform(val_df)
        
        # 创建序列
        seq_length = request.get('model_config', {}).get('seq_length', 60)
        X_train, y_train = fe.create_sequences(train_df_scaled, seq_length)
        X_val, y_val = fe.create_sequences(val_df_scaled, seq_length)
        
        if len(X_train) == 0:
             raise ValueError(f"序列生成导致训练集为空 (len(df)={len(df)}, seq_len={seq_length})")

        # 3. 初始化模型
        model_config = request.get('model_config', {})
        model_config['input_size'] = len(potential_features)
        
        if request['model_type'] == 'LSTM':
            model = LSTMModel(model_config)
        else:
            raise ValueError(f"未知模型类型: {request['model_type']}")
            
        # 4. 训练
        metrics = model.train(X_train, y_train, X_val, y_val)
        
        # 5. 保存工件
        model_id = str(uuid.uuid4())
        base_path = f"models_storage/{model_id}"
        os.makedirs(base_path, exist_ok=True)
        
        model_path = f"{base_path}/model.pth"
        scaler_path = f"{base_path}/scaler.joblib"
        
        model.save(model_path)
        fe.save(scaler_path)
        
        # 6. 保存元数据到数据库
        ai_model = AIModel(
            id=model_id,
            name=request['name'],
            type=request['model_type'],
            version="1.0",
            config={
                "feature_config": request.get('feature_config', []),
                "model_config": model_config,
                "data_config": {
                    "exchange": request['exchange'],
                    "symbol": request['symbol'],
                    "timeframe": request['timeframe'],
                    "start_date": request['start_date'],
                    "end_date": request['end_date']
                }
            },
            metrics=metrics,
            file_path=base_path,
            is_active=False
        )
        
        self.db.add(ai_model)
        await self.db.commit()
        
        return ai_model.to_dict()
