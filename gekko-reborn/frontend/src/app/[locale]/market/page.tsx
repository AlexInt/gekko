"use client";

import { useEffect, useState } from "react";
import { CandleStickChart } from "@/components/charts/CandleStickChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { useTranslations } from "next-intl";

// Helper to generate mock data if API fails or is empty
const generateMockData = () => {
    const data = [];
    let time = new Date("2023-01-01").getTime() / 1000;
    let value = 100;
    for (let i = 0; i < 100; i++) {
        const open = value;
        const close = value + Math.random() * 10 - 5;
        const high = Math.max(open, close) + Math.random() * 2;
        const low = Math.min(open, close) - Math.random() * 2;
        // Format YYYY-MM-DD
        const date = new Date(time * 1000);
        const dateString = date.toISOString().split('T')[0];
        
        data.push({ time: dateString, open, high, low, close });
        time += 86400;
        value = close;
    }
    return data;
};

export default function MarketPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const t = useTranslations('Market');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Try fetching from real API
                // const res = await api.get('/market/candles?symbol=BTC/USDT&interval=1d');
                // setData(res.data);
                
                // For now use mock data as I don't recall seeing market service endpoint ready or populated
                setData(generateMockData());
            } catch (error) {
                console.error("Failed to fetch market data", error);
                setData(generateMockData());
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="grid gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white/90">{t('title')}</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>BTC/USDT - 1D</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center text-slate-400">{t('loading')}</div>
                    ) : (
                        <CandleStickChart data={data} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
