"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Strategy } from "@/types";
import { Play, Loader2, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import api from "@/lib/api";

interface BacktestConfigProps {
    strategies: Strategy[];
    onRunBacktest: (config: any) => void;
    loading: boolean;
}

export default function BacktestConfig({ strategies, onRunBacktest, loading }: BacktestConfigProps) {
    const t = useTranslations('Strategies');
    
    // Config State
    const [selectedStrategyId, setSelectedStrategyId] = useState<string>(strategies[0]?.id || "");
    const [exchange, setExchange] = useState("binance");
    const [symbol, setSymbol] = useState("BTC/USDT");
    const [timeframe, setTimeframe] = useState("1h");
    const [startDate, setStartDate] = useState("2023-01-01T00:00");
    const [endDate, setEndDate] = useState("2023-12-31T23:59");
    const [initialCapital, setInitialCapital] = useState(10000);
    
    // Dynamic Params State
    const [params, setParams] = useState<Record<string, any>>({});

    // Update params when strategy changes
    const handleStrategyChange = (id: string) => {
        setSelectedStrategyId(id);
        const strat = strategies.find(s => s.id === id);
        if (strat) {
            setParams(strat.parameters);
        }
    };

    // Handle param change
    const handleParamChange = (key: string, value: any) => {
        setParams(prev => ({
            ...prev,
            [key]: isNaN(Number(value)) ? value : Number(value)
        }));
    };

    const handleRun = () => {
        onRunBacktest({
            strategy_id: selectedStrategyId,
            exchange,
            symbol,
            timeframe,
            start_date: new Date(startDate).toISOString(),
            end_date: new Date(endDate).toISOString(),
            parameters: params,
            initial_capital: initialCapital
        });
    };

    const currentStrategy = strategies.find(s => s.id === selectedStrategyId);

    return (
        <Card className="border-indigo-500/20 bg-slate-900/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings2 className="h-5 w-5 text-indigo-400" />
                    Backtest Configuration
                </CardTitle>
                <CardDescription>Configure data range and strategy parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Data Selection */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Strategy</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedStrategyId}
                            onChange={(e) => handleStrategyChange(e.target.value)}
                        >
                            {strategies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Exchange</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={exchange}
                            onChange={(e) => setExchange(e.target.value)}
                        >
                            <option value="binance">Binance</option>
                            <option value="kraken">Kraken</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Symbol</label>
                        <Input 
                            value={symbol} 
                            onChange={(e) => setSymbol(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Timeframe</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={timeframe}
                            onChange={(e) => setTimeframe(e.target.value)}
                        >
                            <option value="15m">15m</option>
                            <option value="1h">1h</option>
                            <option value="4h">4h</option>
                            <option value="1d">1d</option>
                        </select>
                    </div>
                </div>

                {/* Date Range & Capital */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Start Date</label>
                        <Input 
                            type="datetime-local"
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">End Date</label>
                        <Input 
                            type="datetime-local"
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-slate-900 border-slate-700 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Initial Capital (USDT)</label>
                        <Input 
                            type="number"
                            value={initialCapital} 
                            onChange={(e) => setInitialCapital(Number(e.target.value))}
                            className="bg-slate-900 border-slate-700 text-white"
                        />
                    </div>
                </div>

                {/* Dynamic Parameters */}
                {currentStrategy && (
                    <div className="space-y-4 pt-4 border-t border-slate-800">
                        <h4 className="text-sm font-medium text-slate-400">Strategy Parameters</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(params).map(([key, value]) => (
                                <div key={key} className="space-y-2">
                                    <label className="text-xs font-medium text-slate-500 uppercase">{key.replace(/_/g, ' ')}</label>
                                    <Input 
                                        value={value} 
                                        onChange={(e) => handleParamChange(key, e.target.value)}
                                        className="bg-slate-900 border-slate-700 text-white h-9"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11" 
                    onClick={handleRun}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Running Simulation...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-5 w-5" /> 
                            Run Backtest
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
