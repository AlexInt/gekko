"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function DataPage() {
    const t = useTranslations('Data');
    const [exchanges, setExchanges] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    
    // Form State
    const [selectedExchange, setSelectedExchange] = useState("binance");
    const [symbol, setSymbol] = useState("BTC/USDT");
    const [timeframe, setTimeframe] = useState("1h");
    const [startDate, setStartDate] = useState("2023-01-01T00:00");
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16));
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExchanges();
    }, []);

    const fetchExchanges = async () => {
        try {
            // For now hardcode popular exchanges if API fails or returns complex object
            // Ideally: const res = await api.get('/market/exchanges');
            // But ccxt returns a huge list, maybe too big for dropdown.
            // Let's stick to a few major ones for now or fetch if needed.
            setExchanges(['binance', 'kraken', 'coinbase', 'kucoin', 'bitfinex']);
        } catch (e) {
            console.error(e);
        }
    };

    const handleImport = async () => {
        setImporting(true);
        setError(null);
        setResult(null);
        
        try {
            const payload = {
                exchange: selectedExchange,
                symbol: symbol,
                timeframe: timeframe,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString()
            };
            
            const res = await api.post('/market/import', payload);
            setResult(res.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white/90">{t('title')}</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('importData')}</CardTitle>
                        <CardDescription>{t('importDescription')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Exchange</label>
                            <select 
                                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={selectedExchange}
                                onChange={(e) => setSelectedExchange(e.target.value)}
                            >
                                {exchanges.map(ex => (
                                    <option key={ex} value={ex}>{ex.toUpperCase()}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Symbol</label>
                            <Input 
                                value={symbol} 
                                onChange={(e) => setSymbol(e.target.value)}
                                placeholder="BTC/USDT" 
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
                                <option value="1m">1 Minute</option>
                                <option value="5m">5 Minutes</option>
                                <option value="15m">15 Minutes</option>
                                <option value="1h">1 Hour</option>
                                <option value="4h">4 Hours</option>
                                <option value="1d">1 Day</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-400 bg-red-900/20 border border-red-900/50 rounded-md">
                                {error}
                            </div>
                        )}

                        {result && (
                            <div className="p-3 text-sm text-green-400 bg-green-900/20 border border-green-900/50 rounded-md">
                                Successfully imported {result.data.imported} candles!
                            </div>
                        )}

                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full bg-indigo-600 hover:bg-indigo-500" 
                            onClick={handleImport}
                            disabled={importing}
                        >
                            {importing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {importing ? 'Importing...' : 'Start Import'}
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('availableDatasets')}</CardTitle>
                        <CardDescription>Local datasets available for backtesting</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-400 text-center py-10">
                            Dataset list implementation pending...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
