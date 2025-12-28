"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Strategy } from "@/types";
import { Play } from "lucide-react";
import { useTranslations } from "next-intl";

// Mock Strategies
const MOCK_STRATEGIES: Strategy[] = [
    {
        id: "golden_cross",
        name: "Golden Cross",
        description: "Classic strategy using SMA 50 and SMA 200 crossover.",
        parameters: {
            short_window: 50,
            long_window: 200
        }
    },
    {
        id: "rsi_strategy",
        name: "RSI Reversal",
        description: "Buy when RSI < 30, Sell when RSI > 70.",
        parameters: {
            period: 14,
            overbought: 70,
            oversold: 30
        }
    },
     {
        id: "lstm_prediction",
        name: "LSTM AI Model",
        description: "Trade based on LSTM model price predictions.",
        parameters: {
            model_id: "latest",
            threshold: 0.02
        }
    }
];

export default function StrategiesPage() {
    const [strategies, setStrategies] = useState<Strategy[]>(MOCK_STRATEGIES);
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [backtestResult, setBacktestResult] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const t = useTranslations('Strategies');

    const handleRunBacktest = async (strategyId: string) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setBacktestResult({
                total_return: 15.4,
                max_drawdown: -5.2,
                trades: 24,
                win_rate: 0.65
            });
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white/90">{t('title')}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {strategies.map((strategy) => (
                    <Card key={strategy.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{strategy.name}</CardTitle>
                            <CardDescription>{strategy.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="text-sm text-slate-400">{t('parameters')}:</div>
                            <pre className="text-xs bg-slate-900/50 border border-white/5 p-2 rounded mt-1 overflow-auto text-slate-300">
                                {JSON.stringify(strategy.parameters, null, 2)}
                            </pre>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" 
                                onClick={() => handleRunBacktest(strategy.id)}
                                disabled={loading}
                            >
                                <Play className="mr-2 h-4 w-4" /> 
                                {loading ? t('running') : t('runBacktest')}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {backtestResult && (
                <Card className="mt-6 border-green-500/20 bg-green-900/10">
                    <CardHeader>
                        <CardTitle className="text-green-400">{t('lastResult')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <div className="text-sm text-slate-400">{t('totalReturn')}</div>
                                <div className="text-xl font-bold text-green-400">+{backtestResult.total_return}%</div>
                            </div>
                            <div>
                                <div className="text-sm text-slate-400">{t('maxDrawdown')}</div>
                                <div className="text-xl font-bold text-red-400">{backtestResult.max_drawdown}%</div>
                            </div>
                             <div>
                                <div className="text-sm text-slate-400">{t('trades')}</div>
                                <div className="text-xl font-bold text-white">{backtestResult.trades}</div>
                            </div>
                             <div>
                                <div className="text-sm text-slate-400">{t('winRate')}</div>
                                <div className="text-xl font-bold text-white">{(backtestResult.win_rate * 100).toFixed(0)}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
