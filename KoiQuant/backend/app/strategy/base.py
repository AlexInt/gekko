from abc import ABC, abstractmethod
import pandas as pd
from typing import Dict, Any, Optional

class BaseStrategy(ABC):
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the strategy with configuration parameters.
        """
        self.config = config or {}

    @abstractmethod
    def analyze(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Analyze the market data and generate signals.
        
        This method should be vectorized for performance.
        
        Args:
            df: Pandas DataFrame with OHLCV data. 
                Expected columns: 'timestamp', 'open', 'high', 'low', 'close', 'volume'.
                Index should be datetime if possible, or integer.
            
        Returns:
            DataFrame with added 'signal' column and any indicator columns.
            Signal values:
            1 = Buy
            -1 = Sell
            0 = Hold/Neutral
        """
        pass
        
    def get_signal(self, df: pd.DataFrame, index: int = -1) -> int:
        """
        Get the signal for a specific index (default: latest).
        """
        if 'signal' not in df.columns:
            return 0
        return df.iloc[index]['signal']
