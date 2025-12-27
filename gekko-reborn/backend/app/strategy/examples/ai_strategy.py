import pandas as pd
import numpy as np
from typing import Dict, Any
import os
from app.strategy.base import BaseStrategy
from app.ai.models.lstm import LSTMModel
from app.ai.feature_engineering import FeatureEngineer

class AIStrategy(BaseStrategy):
    def __init__(self, config: Dict[str, Any] = None):
        """
        配置要求:
        - model_path: .pth 文件路径
        - scaler_path: .joblib 文件路径
        - feature_config: 指标列表
        - seq_length: 整数 (默认 60)
        - threshold: 浮点数 (默认 0.0)
        """
        super().__init__(config)
        self.model_path = config.get('model_path')
        self.scaler_path = config.get('scaler_path')
        self.feature_config = config.get('feature_config', [])
        self.seq_length = config.get('seq_length', 60)
        self.threshold = config.get('threshold', 0.0)
        
        self.model = None
        self.fe = FeatureEngineer()
        
        if self.model_path and os.path.exists(self.model_path):
            self.load_model()

    def load_model(self):
        try:
            # 加载 Scaler
            if self.scaler_path and os.path.exists(self.scaler_path):
                self.fe.load(self.scaler_path)
            
            # 加载模型
            # 使用空配置初始化，load() 方法会覆盖它
            self.model = LSTMModel({})
            self.model.load(self.model_path)
            print(f"AI 策略已从 {self.model_path} 加载模型")
        except Exception as e:
            print(f"加载 AI 模型出错: {e}")

    def analyze(self, df: pd.DataFrame) -> pd.DataFrame:
        if not self.model or not self.fe.scaler:
             # 如果模型未加载，返回 0 信号
             df['signal'] = 0
             return df
             
        # 1. 特征工程
        # 创建副本以避免过度修改原始 df 结构（如果不需要）
        df_calc = df.copy()
        
        # 添加指标
        if self.feature_config:
            df_calc = self.fe.add_technical_indicators(df_calc, self.feature_config)
        
        # 2. 转换 (缩放)
        try:
            # 确保列与 Scaler 期望的一致
            # 如果缺少某些列（例如来自缺失的指标），这里会失败
            df_scaled = self.fe.transform(df_calc)
        except Exception as e:
            print(f"特征缩放过程中出错: {e}")
            df['signal'] = 0
            return df
            
        # 3. 创建序列
        # create_sequences 期望 DataFrame 并返回 X, y
        # 我们只需要 X
        
        # 检查数据是否充足
        if len(df_scaled) < self.seq_length:
            df['signal'] = 0
            return df
            
        X, _ = self.fe.create_sequences(df_scaled, self.seq_length)
        
        if X is None or len(X) == 0:
            df['signal'] = 0
            return df
            
        # 4. 预测
        preds = self.model.predict(X)
        # preds: (samples, 1)
        
        # 5. 生成信号
        # 初始化信号列
        signals = pd.Series(0, index=df.index)
        
        # 对齐预测
        # 第一个预测对应于结束于索引 (seq_length - 1) 的序列
        # 这个预测是针对下一个周期的。
        # 因此在索引 (seq_length - 1) 处，我们有对 (seq_length) 处价格/收益的预测。
        # 如果预测 > 阈值，我们在 (seq_length - 1) 处买入并持有直到 (seq_length)。
        
        start_idx = self.seq_length - 1
        valid_indices = df.index[start_idx : start_idx + len(preds)]
        
        flat_preds = preds.flatten()
        
        # 创建信号
        # 如果预测 > 阈值则为 1
        # 如果预测 < -阈值则为 -1
        pred_signals = np.zeros_like(flat_preds, dtype=int)
        pred_signals[flat_preds > self.threshold] = 1
        pred_signals[flat_preds < -self.threshold] = -1
        
        signals.loc[valid_indices] = pred_signals
        
        df['signal'] = signals
        
        # 可选：将预测值添加到 df 以便调试
        # df['ai_prediction'] = 0.0
        # df.loc[valid_indices, 'ai_prediction'] = flat_preds
        
        return df
