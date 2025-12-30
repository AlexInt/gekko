import talib
import pandas as pd
import numpy as np

class Indicators:
    """
    Wrapper around TA-Lib for Pandas DataFrames/Series.
    """
    
    @staticmethod
    def sma(series: pd.Series, period: int = 14) -> pd.Series:
        """Simple Moving Average"""
        return pd.Series(talib.SMA(series.values, timeperiod=period), index=series.index)

    @staticmethod
    def ema(series: pd.Series, period: int = 14) -> pd.Series:
        """Exponential Moving Average"""
        return pd.Series(talib.EMA(series.values, timeperiod=period), index=series.index)

    @staticmethod
    def rsi(series: pd.Series, period: int = 14) -> pd.Series:
        """Relative Strength Index"""
        return pd.Series(talib.RSI(series.values, timeperiod=period), index=series.index)

    @staticmethod
    def macd(series: pd.Series, fastperiod: int = 12, slowperiod: int = 26, signalperiod: int = 9):
        """Moving Average Convergence/Divergence"""
        macd, macdsignal, macdhist = talib.MACD(
            series.values, 
            fastperiod=fastperiod, 
            slowperiod=slowperiod, 
            signalperiod=signalperiod
        )
        return (
            pd.Series(macd, index=series.index),
            pd.Series(macdsignal, index=series.index),
            pd.Series(macdhist, index=series.index)
        )

    @staticmethod
    def bollinger_bands(series: pd.Series, timeperiod: int = 20, nbdevup: int = 2, nbdevdn: int = 2):
        """Bollinger Bands"""
        upper, middle, lower = talib.BBANDS(
            series.values, 
            timeperiod=timeperiod, 
            nbdevup=nbdevup, 
            nbdevdn=nbdevdn, 
            matype=0
        )
        return (
            pd.Series(upper, index=series.index),
            pd.Series(middle, index=series.index),
            pd.Series(lower, index=series.index)
        )
