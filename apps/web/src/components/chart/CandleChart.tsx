"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, CrosshairMode, CandlestickSeries } from 'lightweight-charts';

interface CandleChartProps {
    newTick: number | null;
    lastCandle: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    } | null;
}

export const CandleChart: React.FC<CandleChartProps> = ({ newTick, lastCandle }) => {
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

        // Fetch historical data from Binance API via Next.js proxy
        const fetchHistoricalData = async () => {
            try {
                const response = await fetch('/api/binance/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100');
                const data = await response.json();

                // Binance klines format: [timestamp, open, high, low, close, volume, ...]
                const historicalData: CandlestickData[] = data.map((candle: any[]) => ({
                    time: Math.floor(candle[0] / 1000) as any, // Convert ms to seconds
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                }));

                candlestickSeries.setData(historicalData);
                lastCandleRef.current = historicalData[historicalData.length - 1];
            } catch (error) {
                console.error('Failed to fetch historical data:', error);

                // Fallback to dummy data if API fails
                const initialData: CandlestickData[] = [];
                let time = Math.floor(Date.now() / 1000) - 60 * 60;
                let open = 95000;

                for (let i = 0; i < 60; i++) {
                    const high = open + Math.random() * 500;
                    const low = open - Math.random() * 500;
                    const close = (Math.random() > 0.5 ? high : low) - Math.random() * 100;

                    initialData.push({ time: time as any, open, high, low, close });

                    time += 60;
                    open = close;
                }

                candlestickSeries.setData(initialData);
                lastCandleRef.current = initialData[initialData.length - 1];
            }
        };

        fetchHistoricalData();

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

    // Handle real-time candle updates from Binance
    useEffect(() => {
        if (!lastCandle || !seriesRef.current) return;

        const candleData = {
            time: lastCandle.time as any,
            open: lastCandle.open,
            high: lastCandle.high,
            low: lastCandle.low,
            close: lastCandle.close,
        };

        seriesRef.current.update(candleData);
        lastCandleRef.current = candleData;
    }, [lastCandle]);

    return (
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
    );
};
