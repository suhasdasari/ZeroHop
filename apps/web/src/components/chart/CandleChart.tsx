"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts';

interface CandleChartProps {
    newTick: number | null;
}

export const CandleChart: React.FC<CandleChartProps> = ({ newTick }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const lastCandleRef = useRef<CandlestickData | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0A0E17' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#1E222D' },
                horzLines: { color: '#1E222D' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: '#1E222D',
            },
            timeScale: {
                borderColor: '#1E222D',
                timeVisible: true,
                secondsVisible: false,
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
        });

        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        // Initial Dummy Data
        const initialData: CandlestickData[] = [];
        let time = Math.floor(Date.now() / 1000) - 60 * 60; // 1 hour ago
        let open = 8500;

        for (let i = 0; i < 60; i++) {
            const high = open + Math.random() * 20;
            const low = open - Math.random() * 20;
            const close = (Math.random() > 0.5 ? high : low) - Math.random() * 5;

            initialData.push({ time: time as any, open, high, low, close });

            time += 60; // Next minute
            open = close;
        }

        candlestickSeries.setData(initialData);
        lastCandleRef.current = initialData[initialData.length - 1];

        chartRef.current = chart;
        seriesRef.current = candlestickSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    useEffect(() => {
        if (!newTick || !seriesRef.current || !lastCandleRef.current) return;

        const timestamp = Math.floor(Date.now() / 1000); // Current unix timestamp
        // Quantize to minute candle
        const candleTime = Math.floor(timestamp / 60) * 60;

        const lastCandle = lastCandleRef.current;
        const lastTime = lastCandle.time as number;

        if (candleTime === lastTime) {
            // Update current candle
            const updatedCandle = {
                ...lastCandle,
                high: Math.max(lastCandle.high, newTick),
                low: Math.min(lastCandle.low, newTick),
                close: newTick,
            };
            seriesRef.current.update(updatedCandle);
            lastCandleRef.current = updatedCandle;
        } else {
            // New Candle
            const newCandle = {
                time: candleTime as any,
                open: lastCandle.close,
                high: Math.max(lastCandle.close, newTick),
                low: Math.min(lastCandle.close, newTick),
                close: newTick,
            };
            seriesRef.current.update(newCandle);
            lastCandleRef.current = newCandle;
        }

    }, [newTick]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};
