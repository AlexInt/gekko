import pytest
import pandas as pd
import numpy as np
import os
import shutil
from app.ai.feature_engineering import FeatureEngineer
from app.ai.models.lstm import LSTMModel

@pytest.fixture
def sample_data():
    # Create sample OHLCV data
    dates = pd.date_range(start='2023-01-01', periods=200, freq='h')
    data = {
        'timestamp': dates,
        'open': np.random.rand(200) * 100,
        'high': np.random.rand(200) * 100,
        'low': np.random.rand(200) * 100,
        'close': np.random.rand(200) * 100,
        'volume': np.random.rand(200) * 1000
    }
    df = pd.DataFrame(data)
    # Ensure High is highest, Low is lowest
    df['high'] = df[['open', 'close']].max(axis=1) + 1
    df['low'] = df[['open', 'close']].min(axis=1) - 1
    return df

def test_feature_engineering(sample_data):
    fe = FeatureEngineer()
    
    # 1. Add indicators
    config = [
        {"name": "RSI", "params": {"timeperiod": 14}},
        {"name": "SMA", "params": {"timeperiod": 20}}
    ]
    df = fe.add_technical_indicators(sample_data, config)
    
    assert 'rsi_14' in df.columns or 'RSI_14' in df.columns
    assert 'sma_20' in df.columns or 'SMA_20' in df.columns
    
    # 2. Add labels
    df = fe.add_labels(df)
    assert 'target' in df.columns
    
    # 3. Fit Scaler
    features = [c for c in df.columns if c not in ['timestamp', 'target']]
    fe.fit_scaler(df, features)
    assert fe.scaler is not None
    
    # 4. Transform
    df_scaled = fe.transform(df)
    assert df_scaled.shape == df.shape
    
    # 5. Sequences
    seq_len = 10
    X, y = fe.create_sequences(df_scaled, seq_len)
    
    assert X.shape[0] == len(df_scaled) - seq_len
    assert X.shape[1] == seq_len
    assert X.shape[2] == len(features)
    assert y.shape[0] == len(df_scaled) - seq_len

def test_lstm_model_training(sample_data):
    # Prepare data
    fe = FeatureEngineer()
    config = [{"name": "RSI", "params": {"timeperiod": 14}}]
    df = fe.add_technical_indicators(sample_data, config)
    df = fe.add_labels(df)
    features = [c for c in df.columns if c not in ['timestamp', 'target']]
    fe.fit_scaler(df, features)
    df_scaled = fe.transform(df)
    X, y = fe.create_sequences(df_scaled, 10)
    
    # Split
    split = int(len(X) * 0.8)
    X_train, y_train = X[:split], y[:split]
    X_val, y_val = X[split:], y[split:]
    
    # Train
    model_config = {
        'input_size': len(features),
        'hidden_size': 16,
        'num_layers': 1,
        'output_size': 1,
        'epochs': 2,
        'batch_size': 16
    }
    model = LSTMModel(model_config)
    metrics = model.train(X_train, y_train, X_val, y_val)
    
    assert 'final_loss' in metrics
    assert metrics['final_loss'] > 0
    
    # Predict
    preds = model.predict(X_val)
    assert preds.shape == (len(X_val), 1)
    
    # Save/Load
    os.makedirs('temp_test_model', exist_ok=True)
    path = 'temp_test_model/model.pth'
    model.save(path)
    
    model2 = LSTMModel({})
    model2.load(path)
    
    preds2 = model2.predict(X_val)
    np.testing.assert_array_almost_equal(preds, preds2)
    
    # Cleanup
    shutil.rmtree('temp_test_model')
