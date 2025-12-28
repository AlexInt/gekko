import ccxt.async_support as ccxt
import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.dialects.postgresql import insert
from app.models.candle import Candle

class MarketService:
    def __init__(self, db_session: Optional[AsyncSession] = None):
        self.exchanges: Dict[str, ccxt.Exchange] = {}
        self.db = db_session

    async def sync_candles(self, exchange_id: str, symbol: str, timeframe: str = '15m'):
        """
        Fetch latest candles and save to database (Upsert).
        """
        if not self.db:
            raise ValueError("Database session not initialized")

        # 1. Fetch data from exchange
        candles_data = await self.fetch_ohlcv(exchange_id, symbol, timeframe, limit=100)
        
        if not candles_data:
            return 0

        # 2. Prepare data for bulk insert
        values = []
        for c in candles_data:
            values.append({
                "exchange": exchange_id,
                "symbol": symbol,
                "timeframe": timeframe,
                "timestamp": c['datetime'],
                "open": c['open'],
                "high": c['high'],
                "low": c['low'],
                "close": c['close'],
                "volume": c['volume']
            })

        # 3. Bulk Upsert (Insert or Ignore if exists)
        # Using PostgreSQL specific ON CONFLICT DO NOTHING
        stmt = insert(Candle).values(values)
        stmt = stmt.on_conflict_do_nothing(
            index_elements=['exchange', 'symbol', 'timeframe', 'timestamp']
        )
        
        result = await self.db.execute(stmt)
        await self.db.commit()
        
        return result.rowcount

    async def import_historical_data(
        self, 
        exchange_id: str, 
        symbol: str, 
        timeframe: str, 
        start_date: datetime, 
        end_date: datetime
    ) -> Dict[str, Any]:
        """
        Import historical data in batches.
        """
        if not self.db:
            raise ValueError("Database session not initialized")
            
        exchange = await self.get_exchange(exchange_id)
        
        # Calculate start timestamp in ms
        since = int(start_date.timestamp() * 1000)
        end_ts = int(end_date.timestamp() * 1000)
        
        total_imported = 0
        
        while since < end_ts:
            # Fetch batch
            candles = await self.fetch_ohlcv(exchange_id, symbol, timeframe, since, limit=1000)
            
            if not candles:
                break
                
            # Prepare for DB
            values = []
            last_ts = 0
            
            for c in candles:
                ts = c['timestamp']
                if ts > end_ts:
                    continue
                    
                values.append({
                    "exchange": exchange_id,
                    "symbol": symbol,
                    "timeframe": timeframe,
                    "timestamp": c['datetime'],
                    "open": c['open'],
                    "high": c['high'],
                    "low": c['low'],
                    "close": c['close'],
                    "volume": c['volume']
                })
                last_ts = ts
            
            if not values:
                break
                
            # Upsert batch
            stmt = insert(Candle).values(values)
            stmt = stmt.on_conflict_do_nothing(
                index_elements=['exchange', 'symbol', 'timeframe', 'timestamp']
            )
            
            await self.db.execute(stmt)
            await self.db.commit()
            
            count = len(values)
            total_imported += count
            print(f"Imported {count} candles for {symbol}. Last date: {values[-1]['timestamp']}")
            
            # Update 'since' for next batch. 
            # Note: last_ts is the start of the last candle.
            # We need the next candle timestamp. 
            # A safe bet is to use the last timestamp + 1ms if exchange supports it, 
            # or rely on the fact that fetch_ohlcv returns candles >= since.
            # To avoid duplicates if exchange returns inclusive start, we might fetch overlap,
            # but ON CONFLICT DO NOTHING handles it.
            # Better approach: set since to last_ts + 1
            if last_ts > 0:
                since = last_ts + 1
            else:
                # Should not happen if candles is not empty
                break
                
            # Rate limit
            await asyncio.sleep(exchange.rateLimit / 1000)
            
        return {"imported": total_imported, "symbol": symbol, "exchange": exchange_id}

    async def get_exchange(self, exchange_id: str) -> ccxt.Exchange:
        """Get or create an exchange instance."""
        if exchange_id not in self.exchanges:
            # Dynamically instantiate the exchange class from ccxt
            if not hasattr(ccxt, exchange_id):
                raise ValueError(f"Exchange {exchange_id} not supported")
            
            exchange_class = getattr(ccxt, exchange_id)
            self.exchanges[exchange_id] = exchange_class({
                'enableRateLimit': True,  # Required by ccxt
            })
            
        return self.exchanges[exchange_id]

    async def get_historical_candles(self, exchange: str, symbol: str, timeframe: str, start_time: datetime, end_time: datetime) -> pd.DataFrame:
        """Fetch historical candles from database as DataFrame"""
        if not self.db:
            raise ValueError("Database session not initialized")

        stmt = select(Candle).where(
            Candle.exchange == exchange,
            Candle.symbol == symbol,
            Candle.timeframe == timeframe,
            Candle.timestamp >= start_time,
            Candle.timestamp <= end_time
        ).order_by(Candle.timestamp.asc())
        
        result = await self.db.execute(stmt)
        candles = result.scalars().all()
        
        if not candles:
            return pd.DataFrame()
            
        data = [c.to_dict() for c in candles]
        return pd.DataFrame(data)

    async def get_latest_price(self, exchange: str, symbol: str) -> Optional[float]:
        """Get latest close price from database"""
        if not self.db:
            return None
            
        stmt = select(Candle.close).where(
            Candle.exchange == exchange,
            Candle.symbol == symbol
        ).order_by(Candle.timestamp.desc()).limit(1)
        
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def fetch_ohlcv(
        self, 
        exchange_id: str, 
        symbol: str, 
        timeframe: str = '15m', 
        since: Optional[int] = None, 
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch OHLCV (Open, High, Low, Close, Volume) data.
        
        Args:
            exchange_id: 'binance', 'kraken', etc.
            symbol: 'BTC/USDT', etc.
            timeframe: '1m', '15m', '1h', '1d'
            since: Timestamp in ms
            limit: Number of candles
        """
        exchange = await self.get_exchange(exchange_id)
        
        try:
            # ccxt returns: [timestamp, open, high, low, close, volume]
            ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            
            # Convert to list of dicts for easier consumption
            candles = []
            for candle in ohlcv:
                candles.append({
                    'timestamp': candle[0],
                    'datetime': datetime.fromtimestamp(candle[0] / 1000),
                    'open': candle[1],
                    'high': candle[2],
                    'low': candle[3],
                    'close': candle[4],
                    'volume': candle[5]
                })
            return candles
            
        except ccxt.NetworkError as e:
            print(f"Network error fetching candles: {e}")
            raise
        except ccxt.ExchangeError as e:
            print(f"Exchange error fetching candles: {e}")
            raise

    async def fetch_ticker(self, exchange_id: str, symbol: str) -> Dict[str, Any]:
        """Fetch current ticker price."""
        exchange = await self.get_exchange(exchange_id)
        return await exchange.fetch_ticker(symbol)

    async def close_all(self):
        """Close all exchange connections."""
        for exchange in self.exchanges.values():
            await exchange.close()
