from typing import Dict, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, and_
from app.models.portfolio import Balance

class PortfolioManager:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def init_paper_account(self, exchange: str, initial_balances: Dict[str, float]):
        """
        初始化模拟账户余额。如果账户已存在，则跳过或重置（此处策略为：若不存在则创建）。
        """
        for asset, amount in initial_balances.items():
            stmt = select(Balance).where(
                Balance.exchange == exchange,
                Balance.asset == asset,
                Balance.is_paper == True
            )
            result = await self.db.execute(stmt)
            balance = result.scalar_one_or_none()
            
            if not balance:
                balance = Balance(
                    exchange=exchange,
                    asset=asset,
                    free=amount,
                    locked=0.0,
                    is_paper=True
                )
                self.db.add(balance)
        
        await self.db.commit()

    async def get_balance(self, exchange: str, asset: str, is_paper: bool = True) -> Optional[Balance]:
        stmt = select(Balance).where(
            Balance.exchange == exchange,
            Balance.asset == asset,
            Balance.is_paper == is_paper
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_portfolio(self, exchange: str, is_paper: bool = True) -> List[Balance]:
        stmt = select(Balance).where(
            Balance.exchange == exchange,
            Balance.is_paper == is_paper
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def update_balance(self, exchange: str, asset: str, delta: float, is_paper: bool = True):
        """
        更新余额。delta 可以是负数（扣款）。
        如果余额不足（free + delta < 0），会抛出异常还是允许透支？
        此处实现为原子更新，假设调用方已检查足够。
        如果是扣款，必须确保 free >= abs(delta)。
        """
        # 为了安全，这里应该先检查余额，或者在 update 语句中加 where 条件
        # 简单起见，我们先查询再更新（注意：高并发下可能有竞争，但对于单用户/单策略系统尚可）
        
        balance = await self.get_balance(exchange, asset, is_paper)
        if not balance:
            # 如果是入账且账户不存在，则创建
            if delta > 0:
                balance = Balance(
                    exchange=exchange,
                    asset=asset,
                    free=delta,
                    locked=0.0,
                    is_paper=is_paper
                )
                self.db.add(balance)
                await self.db.commit()
                return
            else:
                raise ValueError(f"Asset {asset} not found in portfolio")

        if balance.free + delta < 0:
            raise ValueError(f"Insufficient funds for {asset}: {balance.free} < {abs(delta)}")

        balance.free += delta
        await self.db.commit()
