from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.market_service import MarketService
from app.services.order_manager import OrderManager
from app.strategy.examples.ai_strategy import AIStrategy
from app.core.database import async_session
from datetime import datetime, timedelta
import asyncio

scheduler = AsyncIOScheduler()

async def run_strategy_job(exchange: str, symbol: str, timeframe: str = '15m'):
    """
    Run AI Strategy after market data update.
    """
    print(f"Running strategy for {exchange} {symbol}...")
    
    async with async_session() as session:
        market_service = MarketService(session)
        order_manager = OrderManager(session)
        
        # 1. Prepare Data (Last 100 candles)
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=2) # Fetch enough history
        
        df = await market_service.get_historical_candles(exchange, symbol, timeframe, start_time, end_time)
        
        if df.empty:
            print("No data for strategy")
            return

        # 2. Initialize Strategy
        # TODO: Load config from DB
        config = {
            "model_path": "model.pth", # Placeholder
            "scaler_path": "scaler.joblib",
            "feature_config": [], # Should match training
            "seq_length": 60,
            "threshold": 0.5
        }
        
        strategy = AIStrategy(config)
        
        # 3. Analyze
        # AIStrategy needs a trained model to produce signals. 
        # If model file missing, it returns 0 signals.
        df_analyzed = strategy.analyze(df)
        
        # 4. Check Signal (Last candle)
        last_signal = df_analyzed.iloc[-1]['signal'] if 'signal' in df_analyzed else 0
        
        if last_signal != 0:
            print(f"Signal Detected: {last_signal} for {symbol}")
            side = 'buy' if last_signal > 0 else 'sell'
            
            try:
                # 5. Execute Order (Paper Trading)
                # Fixed amount for demo
                amount = 0.01 if symbol.startswith('BTC') else 0.1
                
                order = await order_manager.create_order(
                    exchange=exchange,
                    symbol=symbol,
                    side=side,
                    amount=amount,
                    is_paper=True
                )
                print(f"Order Placed: {order.side} {order.amount} {order.symbol} @ {order.filled_price}")
            except Exception as e:
                print(f"Order execution failed: {e}")
        else:
            print("No signal")

async def fetch_market_data_job():
    """
    Cron job to fetch market data every 15 minutes.
    """
    print("Running market data fetch job...")
    
    # In a real app, these would come from config/database
    pairs_to_watch = [
        ('binance', 'BTC/USDT'),
        ('binance', 'ETH/USDT'),
    ]
    
    async with async_session() as session:
        market_service = MarketService(session)
        
        for exchange_id, symbol in pairs_to_watch:
            try:
                count = await market_service.sync_candles(exchange_id, symbol, '15m')
                print(f"Synced {count} candles for {symbol} on {exchange_id}")
                
                # Trigger Strategy immediately after sync
                # Ideally, this should be decoupled (event-driven), but direct call works for MVP
                await run_strategy_job(exchange_id, symbol, '15m')
                
            except Exception as e:
                print(f"Error syncing {symbol}: {e}")
        
        await market_service.close_all()

def start_scheduler():
    # Schedule job every 15 minutes
    scheduler.add_job(fetch_market_data_job, 'interval', minutes=15)
    scheduler.start()
