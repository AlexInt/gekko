import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.candle import Candle
from app.models.order import Order
from app.models.portfolio import Balance
from app.services.order_manager import OrderManager
from app.services.portfolio_manager import PortfolioManager
from datetime import datetime

# Use SQLite for testing logic
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def db_session():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        yield session
    
    await engine.dispose()

@pytest.mark.asyncio
async def test_paper_trading_flow(db_session):
    # 1. Setup Data
    # Insert a candle for BTC/USDT price = 50000
    candle = Candle(
        exchange='binance',
        symbol='BTC/USDT',
        timeframe='15m',
        timestamp=datetime.now(),
        open=50000.0, high=50100.0, low=49900.0, close=50000.0, volume=1.0
    )
    db_session.add(candle)
    await db_session.commit()
    
    # Init Portfolio: 100,000 USDT
    pm = PortfolioManager(db_session)
    await pm.init_paper_account('binance', {'USDT': 100000.0})
    
    om = OrderManager(db_session)
    
    # 2. Buy 1 BTC
    order = await om.create_order(
        exchange='binance',
        symbol='BTC/USDT',
        side='buy',
        amount=1.0,
        order_type='market',
        is_paper=True
    )
    
    assert order.status == 'filled'
    assert order.filled_price == 50000.0
    assert order.cost == 50000.0
    
    # Check Balance
    # USDT: 100000 - 50000 = 50000
    usdt = await pm.get_balance('binance', 'USDT')
    assert usdt.free == 50000.0
    
    # BTC: 1 * (1 - 0.001) = 0.999
    btc = await pm.get_balance('binance', 'BTC')
    assert btc.free == 0.999
    
    # 3. Sell 0.5 BTC
    # Price still 50000
    order_sell = await om.create_order(
        exchange='binance',
        symbol='BTC/USDT',
        side='sell',
        amount=0.5,
        order_type='market',
        is_paper=True
    )
    
    assert order_sell.status == 'filled'
    
    # Check Balance
    # BTC: 0.999 - 0.5 = 0.499
    await db_session.refresh(btc)
    assert btc.free == 0.499
    
    # USDT: 50000 + (0.5 * 50000 * 0.999) 
    # Revenue = 25000. Fee = 25. Net = 24975.
    # Total = 50000 + 24975 = 74975
    await db_session.refresh(usdt)
    assert usdt.free == 74975.0
