"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Trade {
    type: 'buy' | 'sell';
    price: number;
    amount: number;
    timestamp: string;
    cost?: number;
    revenue?: number;
    fee?: number;
}

interface BacktestResultProps {
    result: {
        total_return: number;
        max_drawdown: number;
        trades_count: number;
        final_equity: number;
        win_rate?: number;
        equity_curve: any[];
        trades: Trade[];
    }
}

export default function BacktestResult({ result }: BacktestResultProps) {
    const t = useTranslations('Strategies');

    // Format data for chart
    const chartData = result.equity_curve.map(item => ({
        time: new Date(item.timestamp).toLocaleDateString(),
        equity: item.equity
    }));

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <div className="text-sm text-slate-400">{t('totalReturn')}</div>
                        <div className={`text-2xl font-bold ${result.total_return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {result.total_return > 0 ? '+' : ''}{(result.total_return * 100).toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <div className="text-sm text-slate-400">{t('maxDrawdown')}</div>
                        <div className="text-2xl font-bold text-red-400">
                            {(result.max_drawdown * 100).toFixed(2)}%
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <div className="text-sm text-slate-400">{t('trades')}</div>
                        <div className="text-2xl font-bold text-white">
                            {result.trades_count}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <div className="text-sm text-slate-400">Final Equity</div>
                        <div className="text-2xl font-bold text-indigo-400">
                            ${result.final_equity.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 12}}
                                    minTickGap={30}
                                />
                                <YAxis 
                                    stroke="#94a3b8" 
                                    tick={{fontSize: 12}}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#818cf8' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="equity" 
                                    stroke="#818cf8" 
                                    strokeWidth={2} 
                                    dot={false}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Trades List */}
            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                    <CardTitle>Trade History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.trades.map((trade, idx) => (
                                    <tr key={idx} className="border-b border-slate-800">
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${trade.type === 'buy' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {trade.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{new Date(trade.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4">${trade.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{trade.amount.toFixed(6)}</td>
                                        <td className="px-6 py-4">
                                            ${((trade.cost || trade.revenue || 0)).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {result.trades.length === 0 && (
                            <div className="text-center py-8 text-slate-500">No trades executed</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
