import pytest
import pytest_asyncio
from unittest.mock import MagicMock, AsyncMock, patch
from app.services.market_service import MarketService
from app.models.candle import Candle
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime

@pytest_asyncio.fixture
async def mock_db_session():
    """Mock database session."""
    session = AsyncMock(spec=AsyncSession)
    session.execute = AsyncMock()
    session.commit = AsyncMock()
    return session

@pytest_asyncio.fixture
async def market_service(mock_db_session):
    """MarketService instance with mocked DB."""
    return MarketService(db_session=mock_db_session)

@pytest.mark.asyncio
async def test_fetch_ohlcv_success(market_service):
    """Test fetching OHLCV data from mock exchange."""
    # Mock ccxt exchange
    mock_exchange = AsyncMock()
    mock_exchange.fetch_ohlcv.return_value = [
        [1672531200000, 16500.0, 16600.0, 16400.0, 16550.0, 100.0],
        [1672532100000, 16550.0, 16650.0, 16500.0, 16600.0, 150.0],
    ]
    
    # Inject mock exchange
    with patch('ccxt.binance', return_value=mock_exchange):
        # We need to manually populate the cache or mock get_exchange
        market_service.exchanges['binance'] = mock_exchange
        
        candles = await market_service.fetch_ohlcv('binance', 'BTC/USDT', '15m')
        
        assert len(candles) == 2
        assert candles[0]['open'] == 16500.0
        assert candles[0]['volume'] == 100.0
        assert isinstance(candles[0]['datetime'], datetime)

@pytest.mark.asyncio
async def test_sync_candles_db_insert(market_service, mock_db_session):
    """Test syncing candles calls DB execute."""
    # Mock fetch_ohlcv to return data
    mock_candles = [
        {
            'timestamp': 1672531200000,
            'datetime': datetime.fromtimestamp(1672531200000 / 1000),
            'open': 16500.0, 'high': 16600.0, 'low': 16400.0, 'close': 16550.0, 'volume': 100.0
        }
    ]
    
    # Mock the internal method
    market_service.fetch_ohlcv = AsyncMock(return_value=mock_candles)
    
    # Mock DB execute result
    mock_result = MagicMock()
    mock_result.rowcount = 1
    mock_db_session.execute.return_value = mock_result
    
    # Run sync
    count = await market_service.sync_candles('binance', 'BTC/USDT')
    
    assert count == 1
    # Verify DB was called
    assert mock_db_session.execute.called
    assert mock_db_session.commit.called
