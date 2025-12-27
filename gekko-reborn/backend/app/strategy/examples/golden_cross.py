import pandas as pd
from app.strategy.base import BaseStrategy
from app.strategy.indicators import Indicators

class GoldenCrossStrategy(BaseStrategy):
    def __init__(self, config: dict = None):
        super().__init__(config)
        self.fast_period = self.config.get('fast_period', 50)
        self.slow_period = self.config.get('slow_period', 200)

    def analyze(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Golden Cross Strategy:
        Buy when SMA(Fast) > SMA(Slow)
        Sell when SMA(Fast) < SMA(Slow)
        """
        # Calculate Indicators
        df['sma_fast'] = Indicators.sma(df['close'], self.fast_period)
        df['sma_slow'] = Indicators.sma(df['close'], self.slow_period)
        
        # Generate Signals
        # Initialize signal column with 0
        df['signal'] = 0
        
        # Condition for Long (Buy)
        # We want to capture the crossover.
        # Simple approach: State-based.
        # If Fast > Slow -> Hold Long (1).
        # If Fast < Slow -> Hold Short/Cash (-1 or 0).
        
        # Let's use a simple state approach first:
        # 1 = Bullish State (Hold)
        # -1 = Bearish State (Sell/Empty)
        
        df.loc[df['sma_fast'] > df['sma_slow'], 'signal'] = 1
        df.loc[df['sma_fast'] < df['sma_slow'], 'signal'] = -1
        
        # However, our BacktestEngine expects a signal to TRIGGER a trade.
        # If we return a state (1, 1, 1, 1), the engine needs to handle "Already in position".
        # My engine implementation checks `if signal == 1 and position == 0`.
        # So returning the State is compatible with the current Engine logic.
        
        # If we wanted to trade only on CROSSOVERS, we would do:
        # df['crossover'] = np.where(df['sma_fast'] > df['sma_slow'], 1, -1)
        # df['signal'] = df['crossover'].diff() 
        # But sticking to state is robust.
        
        return df
