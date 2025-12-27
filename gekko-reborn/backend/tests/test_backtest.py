import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.strategy.examples.golden_cross import GoldenCrossStrategy
from app.backtest.engine import BacktestEngine

@pytest.fixture
def market_data():
    # Generate synthetic data
    # Price starts at 100, goes up to 150, then down to 50
    dates = [datetime(2023, 1, 1) + timedelta(days=i) for i in range(100)]
    
    # Create a wave pattern
    x = np.linspace(0, 4*np.pi, 100)
    prices = 100 + 50 * np.sin(x)
    
    df = pd.DataFrame({
        'timestamp': dates,
        'open': prices,
        'high': prices + 1,
        'low': prices - 1,
        'close': prices,
        'volume': 1000
    })
    return df

def test_golden_cross_strategy(market_data):
    # Use short periods to ensure crossovers in 100 data points
    strategy = GoldenCrossStrategy(config={'fast_period': 5, 'slow_period': 10})
    
    # 1. Analyze
    analyzed_df = strategy.analyze(market_data.copy())
    
    assert 'sma_fast' in analyzed_df.columns
    assert 'sma_slow' in analyzed_df.columns
    assert 'signal' in analyzed_df.columns
    
    # Check if we have signals (both 1 and -1)
    unique_signals = analyzed_df['signal'].unique()
    assert 1 in unique_signals
    assert -1 in unique_signals

def test_backtest_execution(market_data):
    strategy = GoldenCrossStrategy(config={'fast_period': 5, 'slow_period': 10})
    engine = BacktestEngine(strategy, initial_capital=10000.0)
    
    results = engine.run(market_data)
    
    assert results is not None
    assert 'total_return' in results
    assert 'total_trades' in results
    assert results['total_trades'] > 0
    assert 'equity_curve' in results
    assert len(results['equity_curve']) == len(market_data) - 1 # First bar skipped for signal lag
