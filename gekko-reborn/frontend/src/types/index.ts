export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  price: number;
  quantity: number;
  status: 'open' | 'closed' | 'canceled' | 'filled';
  created_at: string;
}

export interface PortfolioItem {
  asset: string;
  free: number;
  locked: number;
  total: number;
  value_in_usdt: number;
}

export interface Portfolio {
  total_balance_usdt: number;
  items: PortfolioItem[];
}

export interface Strategy {
    id: string;
    name: string;
    description: string;
    parameters: Record<string, any>;
}

export interface AIModel {
    id: string;
    name: string;
    type: string;
    status: 'created' | 'training' | 'ready' | 'failed';
    accuracy?: number;
    created_at: string;
}
