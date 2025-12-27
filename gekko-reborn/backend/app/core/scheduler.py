from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.services.market_service import MarketService
from app.core.database import async_session
import asyncio

scheduler = AsyncIOScheduler()

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
            except Exception as e:
                print(f"Error syncing {symbol}: {e}")
        
        await market_service.close_all()

def start_scheduler():
    # Schedule job every 15 minutes
    scheduler.add_job(fetch_market_data_job, 'interval', minutes=15)
    scheduler.start()
