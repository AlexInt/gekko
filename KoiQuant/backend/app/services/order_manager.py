from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.order import Order
from app.services.portfolio_manager import PortfolioManager
from app.services.market_service import MarketService
import logging

logger = logging.getLogger(__name__)

class OrderManager:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.portfolio_mgr = PortfolioManager(db)
        self.market_service = MarketService(db)

    async def create_order(
        self, 
        exchange: str, 
        symbol: str, 
        side: str, 
        amount: float, 
        order_type: str = 'market', 
        price: Optional[float] = None,
        is_paper: bool = True
    ) -> Order:
        """
        创建订单。
        如果 is_paper=True，则进行模拟撮合。
        """
        if is_paper:
            return await self._process_paper_order(exchange, symbol, side, amount, order_type, price)
        else:
            raise NotImplementedError("Live trading not implemented yet")

    async def _process_paper_order(
        self, 
        exchange: str, 
        symbol: str, 
        side: str, 
        amount: float, 
        order_type: str, 
        price: Optional[float]
    ) -> Order:
        # 1. Determine Price
        if order_type == 'market':
            if price is None:
                price = await self.market_service.get_latest_price(exchange, symbol)
                if price is None:
                    raise ValueError(f"No price data found for {exchange}:{symbol}")
        elif order_type == 'limit':
            if price is None:
                raise ValueError("Price is required for limit orders")
            # For limit orders in paper trading, we might just place them as PENDING.
            # But for this iteration, let's assume if it's a Limit Order, 
            # we check if current price crosses limit. If not, maybe throw error or support pending?
            # User requirement 2.1: "While订单处于PENDING...when获取到新的市场价格...shall判断订单是否成交"
            # Since we don't have a background loop checking pending orders yet in this specific function call,
            # Let's support Market Order execution primarily.
            # If Limit Order, we can save as Pending.
            pass 
        else:
            raise ValueError(f"Unsupported order type: {order_type}")

        # If it's a Limit order and we don't support instant match logic here, save as pending
        if order_type == 'limit':
             # TODO: Implement Pending Order matching loop
             order = Order(
                exchange=exchange,
                symbol=symbol,
                side=side,
                type=order_type,
                status='pending',
                price=price,
                amount=amount,
                is_paper=True
            )
             self.db.add(order)
             await self.db.commit()
             return order

        # For Market Order, execute immediately
        fee_rate = 0.001
        cost = price * amount
        
        base_asset, quote_asset = symbol.split('/')
        
        # 2. Check Balance & Execute
        if side == 'buy':
            # Need USDT (Quote)
            # Cost = price * amount. 
            required_quote = cost
            
            # Check and deduct Quote
            await self.portfolio_mgr.update_balance(exchange, quote_asset, -required_quote, is_paper=True)
            
            # Add Base (Amount - Fee)
            # Assuming fee is taken from the bought asset
            received_base = amount * (1 - fee_rate)
            await self.portfolio_mgr.update_balance(exchange, base_asset, received_base, is_paper=True)
            
            order_fee = amount * fee_rate # Fee in Base
            
        elif side == 'sell':
            # Need BTC (Base)
            required_base = amount
            
            # Check and deduct Base
            await self.portfolio_mgr.update_balance(exchange, base_asset, -required_base, is_paper=True)
            
            # Add Quote (Cost - Fee)
            received_quote = cost * (1 - fee_rate)
            await self.portfolio_mgr.update_balance(exchange, quote_asset, received_quote, is_paper=True)
            
            order_fee = cost * fee_rate # Fee in Quote
            
        else:
            raise ValueError(f"Invalid side: {side}")

        # 3. Create Order Record
        order = Order(
            exchange=exchange,
            symbol=symbol,
            side=side,
            type=order_type,
            status='filled', # Instant fill for paper market orders
            price=price if order_type == 'limit' else None,
            amount=amount,
            filled_price=price,
            filled_amount=amount,
            fee=order_fee,
            cost=cost,
            is_paper=True
        )
        self.db.add(order)
        await self.db.commit()
        await self.db.refresh(order)
        
        return order
