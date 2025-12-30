import pandas as pd
import numpy as np
from typing import Dict, Any
from app.strategy.base import BaseStrategy

class BacktestEngine:
    def __init__(self, strategy: BaseStrategy, initial_capital: float = 10000.0, fee_rate: float = 0.001):
        self.strategy = strategy
        self.initial_capital = initial_capital
        self.fee_rate = fee_rate

    def run(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Run the backtest simulation.
        
        Args:
            df: DataFrame containing market data.
            
        Returns:
            Dictionary containing backtest results and performance metrics.
        """
        # Ensure data is sorted
        df = df.sort_values('timestamp').reset_index(drop=True)
        
        # 1. Generate Signals
        df = self.strategy.analyze(df)
        
        # 2. Simulate Trading
        # We will assume we buy/sell at the CLOSE price of the signal candle for simplicity in this version,
        # or NEXT OPEN. Let's use NEXT OPEN to be realistic (avoid look-ahead bias).
        # Signal at T (Close) -> Action at T+1 (Open)
        
        balance = self.initial_capital
        position = 0.0 # Amount of asset
        
        trades = []
        equity_curve = []
        
        # Shift signal to represent execution at next bar
        # If signal is 1 at index i, we buy at index i+1
        
        for i in range(1, len(df)):
            current_bar = df.iloc[i]
            prev_bar = df.iloc[i-1]
            
            signal = prev_bar.get('signal', 0)
            price = current_bar['open']
            timestamp = current_bar['timestamp']
            
            # Execute Trade based on signal from PREVIOUS bar
            if signal == 1 and position == 0:
                # Buy
                cost = balance * (1 - self.fee_rate)
                position = cost / price
                balance = 0
                trades.append({
                    'type': 'buy',
                    'price': price,
                    'amount': position,
                    'timestamp': timestamp,
                    'cost': cost,
                    'fee': self.initial_capital - cost # Approximate for first trade, need better tracking
                })
            
            elif signal == -1 and position > 0:
                # Sell
                revenue = position * price * (1 - self.fee_rate)
                balance = revenue
                position = 0
                trades.append({
                    'type': 'sell',
                    'price': price,
                    'amount': position, # 0
                    'timestamp': timestamp,
                    'revenue': revenue
                })
                
            # Calculate current equity
            current_equity = balance + (position * current_bar['close'])
            equity_curve.append({
                'timestamp': timestamp,
                'equity': current_equity
            })
            
        # 3. Calculate Metrics
        equity_df = pd.DataFrame(equity_curve)
        if equity_df.empty:
            return {"error": "No data or short duration"}
            
        final_equity = equity_df.iloc[-1]['equity']
        total_return = (final_equity - self.initial_capital) / self.initial_capital
        
        # Max Drawdown
        equity_df['peak'] = equity_df['equity'].cummax()
        equity_df['drawdown'] = (equity_df['equity'] - equity_df['peak']) / equity_df['peak']
        max_drawdown = equity_df['drawdown'].min()
        
        return {
            "initial_capital": self.initial_capital,
            "final_equity": final_equity,
            "total_return": total_return,
            "total_return_pct": total_return * 100,
            "max_drawdown": max_drawdown,
            "max_drawdown_pct": max_drawdown * 100,
            "total_trades": len(trades),
            "trades": trades,
            "equity_curve": equity_df.to_dict(orient='records')
        }
