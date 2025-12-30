import pandas as pd
import numpy as np
import talib
from talib import abstract
from typing import List, Dict, Tuple, Optional, Any, Union
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import joblib
import os

class FeatureEngineer:
    def __init__(self):
        self.scaler = None
        self.feature_columns: List[str] = []
        self.target_column: Optional[str] = None

    def prepare_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """基础数据准备：确保浮点类型并将列名转换为小写"""
        df = df.copy()
        # 确保列名为小写
        df.columns = [c.lower() for c in df.columns]
        
        # 确保 OHLCV 列存在且为浮点型
        required_cols = ['open', 'high', 'low', 'close', 'volume']
        for col in required_cols:
            if col in df.columns:
                df[col] = df[col].astype(float)
        return df

    def add_technical_indicators(self, df: pd.DataFrame, config: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        根据配置向 DataFrame 添加技术指标。
        配置示例：
        [
            {"name": "RSI", "params": {"timeperiod": 14}},
            {"name": "SMA", "params": {"timeperiod": 20}},
            {"name": "MACD", "params": {"fastperiod": 12, "slowperiod": 26, "signalperiod": 9}}
        ]
        """
        df = self.prepare_data(df)
        
        # 为 abstract API 准备输入
        # Abstract API 期望一个 numpy 数组的字典
        inputs = {
            'open': df['open'].values,
            'high': df['high'].values,
            'low': df['low'].values,
            'close': df['close'].values,
            'volume': df['volume'].values
        }

        for indicator in config:
            name = indicator['name'].upper()
            params = indicator.get('params', {})
            
            try:
                func = getattr(abstract, name)
                result = func(inputs, **params)
                
                # 构建列名
                suffix = ""
                if params:
                    # 从参数创建后缀，例如 _14 或 _12_26_9
                    suffix = "_" + "_".join([str(v) for v in params.values()])
                
                if isinstance(result, np.ndarray):
                    col_name = f"{name}{suffix}"
                    df[col_name] = result
                elif isinstance(result, list) or isinstance(result, tuple):
                    # 对于返回多个值的指标（如 MACD）
                    # talib abstract 通常返回单独的数组。
                    # 我们需要知道输出名称。
                    # 通常 abstract.MACD 返回 (macd, macdsignal, macdhist)
                    output_names = func.info.get('output_names', [])
                    if output_names:
                        for i, out_name in enumerate(output_names):
                            col_name = f"{name}_{out_name}{suffix}"
                            df[col_name] = result[i]
                    else:
                         for i, res in enumerate(result):
                             df[f"{name}_{i}{suffix}"] = res
                             
            except Exception as e:
                print(f"计算指标 {name} 时出错: {e}")
        
        # 删除因指标计算产生的包含 NaN 值的行
        return df.dropna()

    def add_labels(self, df: pd.DataFrame, target_col: str = 'close', shift: int = -1, binary: bool = False) -> pd.DataFrame:
        """
        添加标签列。
        shift: 负数表示未来，正数表示过去。通常为负数用于预测（例如 -1 表示下一根 K 线）。
        binary: 如果为 True，当收益率 > 0 时标签为 1，否则为 0。如果为 False，标签即为收益率。
        """
        df = df.copy()
        # 计算收益率：(未来价格 - 当前价格) / 当前价格
        # shift(-1) 给出当前索引处的下一行值
        future_price = df[target_col].shift(shift)
        returns = (future_price - df[target_col]) / df[target_col]
        
        if binary:
            df['target'] = (returns > 0).astype(int)
        else:
            df['target'] = returns
            
        self.target_column = 'target'
        return df.dropna()

    def fit_scaler(self, df: pd.DataFrame, feature_columns: List[str], method: str = 'z-score'):
        """在特征列上拟合归一化器 (Scaler)"""
        self.feature_columns = feature_columns
        features = df[self.feature_columns]
        
        if method == 'z-score':
            self.scaler = StandardScaler()
        elif method == 'min-max':
            self.scaler = MinMaxScaler()
        else:
            raise ValueError(f"未知的缩放方法: {method}")
            
        self.scaler.fit(features)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """应用缩放"""
        if self.scaler is None:
            raise ValueError("Scaler 尚未拟合")
            
        df_scaled = df.copy()
        # 仅缩放特征列
        df_scaled[self.feature_columns] = self.scaler.transform(df[self.feature_columns])
        return df_scaled

    def create_sequences(self, df: pd.DataFrame, seq_length: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        为 LSTM 创建序列数据。
        假设 df 已经过缩放并包含 'target' 列。
        X: (样本数, 序列长度, 特征数)
        y: (样本数, ) 
        """
        if not self.feature_columns:
            raise ValueError("未定义特征列")
            
        data = df[self.feature_columns].values
        
        # 如果存在目标列，则返回 X 和 y。否则仅返回 X。
        has_target = self.target_column in df.columns
        targets = df[self.target_column].values if has_target else None
        
        xs = []
        ys = []
        
        for i in range(len(data) - seq_length):
            x = data[i : i + seq_length]
            xs.append(x)
            if has_target:
                # 目标是序列之后的值
                # 例如序列 [0..9]，目标在索引 9（下一个预测）
                # 序列: t-N ... t
                # 预测: t+1 处的收益（存储在 t 行的 'target' 中）
                # 因此我们取 i + seq_length - 1 处的目标
                y = targets[i + seq_length - 1]
                ys.append(y)
            
        return np.array(xs), np.array(ys) if has_target else None

    def save(self, path: str):
        """保存 Scaler 和配置"""
        data = {
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'target_column': self.target_column
        }
        joblib.dump(data, path)

    def load(self, path: str):
        """加载 Scaler 和配置"""
        data = joblib.load(path)
        self.scaler = data['scaler']
        self.feature_columns = data['feature_columns']
        self.target_column = data.get('target_column')
