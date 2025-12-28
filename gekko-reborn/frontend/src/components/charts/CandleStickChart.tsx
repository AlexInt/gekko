"use client";

import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

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
    const {
        data,
        colors: {
            backgroundColor = 'transparent',
            textColor = '#DDD',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && chartContainerRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        if (chartContainerRef.current) {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                },
                width: chartContainerRef.current.clientWidth,
                height: 400,
                grid: {
                    vertLines: { color: 'rgba(197, 203, 206, 0.1)' },
                    horzLines: { color: 'rgba(197, 203, 206, 0.1)' },
                },
                timeScale: {
                    borderColor: 'rgba(197, 203, 206, 0.1)',
                },
                rightPriceScale: {
                    borderColor: 'rgba(197, 203, 206, 0.1)',
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
    }, [data, backgroundColor, textColor]);

    return (
        <div
            ref={chartContainerRef}
            className="w-full relative"
        />
    );
};
