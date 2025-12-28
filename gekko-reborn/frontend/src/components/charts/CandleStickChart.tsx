"use client";

import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';
import { useTheme } from "next-themes";

interface CandleData {
    time: string; // 'yyyy-mm-dd'
    open: number;
    high: number;
    low: number;
    close: number;
}

interface CandleStickChartProps {
    data: CandleData[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const CandleStickChart = (props: CandleStickChartProps) => {
    const { resolvedTheme } = useTheme();
    const {
        data,
        colors: {
            backgroundColor = 'transparent',
            textColor,
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        const isDark = resolvedTheme === "dark";
        const resolvedTextColor = textColor ?? (isDark ? "#e2e8f0" : "#0f172a");
        const gridLineColor = isDark
            ? "rgba(197, 203, 206, 0.1)"
            : "rgba(15, 23, 42, 0.12)";

        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        if (chartContainerRef.current) {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor: resolvedTextColor,
                },
                width: chartContainerRef.current.clientWidth,
                height: 400,
                grid: {
                    vertLines: { color: gridLineColor },
                    horzLines: { color: gridLineColor },
                },
                timeScale: {
                    borderColor: gridLineColor,
                },
                rightPriceScale: {
                    borderColor: gridLineColor,
                }
            });
            chartRef.current = chart;

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#26a69a',
                downColor: '#ef5350',
                borderVisible: false,
                wickUpColor: '#26a69a',
                wickDownColor: '#ef5350',
            });

            // Need to cast data to any because lightweight-charts expects time as UTCTimestamp but we use string
            // Actually it supports string 'yyyy-mm-dd'
            candlestickSeries.setData(data as any);
            
            chart.timeScale().fitContent();

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                chart.remove();
            };
        }
    }, [data, backgroundColor, resolvedTheme, textColor]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full relative"
        />
    );
};
