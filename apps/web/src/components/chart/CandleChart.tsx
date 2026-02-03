"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType, CrosshairMode, CandlestickSeries, HistogramSeries } from 'lightweight-charts';

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

interface CandleChartProps {
    lastCandle: {
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    } | null;
}

export const CandleChart: React.FC<CandleChartProps> = ({ lastCandle }) => {
    const [timeframe, setTimeframe] = useState<Timeframe>('1h');
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const lastCandleRef = useRef<CandlestickData | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Get user's timezone offset in minutes
        const timezoneOffset = new Date().getTimezoneOffset();

        // Create chart with modern professional styling
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#9ca3af',
                fontSize: 12,
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            },
            grid: {
                vertLines: {
                    color: 'rgba(255, 255, 255, 0.06)',
                    style: 1,
                    visible: true,
                },
                horzLines: {
                    color: 'rgba(255, 255, 255, 0.06)',
                    style: 1,
                    visible: true,
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: 'rgba(99, 102, 241, 0.6)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#6366f1',
                },
                horzLine: {
                    color: 'rgba(99, 102, 241, 0.6)',
                    width: 1,
                    style: 2,
                    labelBackgroundColor: '#6366f1',
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                scaleMargins: {
                    top: 0.05,
                    bottom: 0.25,
                },
            },
            timeScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
                timeVisible: true,
                secondsVisible: false,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            localization: {
                timeFormatter: (timestamp: number) => {
                    // Convert UTC timestamp to user's local time
                    const date = new Date(timestamp * 1000);
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                axisPressedMouseMove: true,
                mouseWheel: true,
                pinch: true,
            },
        });

        // Add candlestick series with vibrant modern colors
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });

        // Add volume histogram with modern styling
        const volumeSeries = chart.addSeries(HistogramSeries, {
            color: '#6366f1',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
        });

        // Fetch historical data from Binance.US API
        const fetchHistoricalData = async () => {
            try {
                const response = await fetch(`/api/binance/api/v3/klines?symbol=BTCUSDT&interval=${timeframe}&limit=100`);
                const data = await response.json();

                // Binance klines format: [timestamp, open, high, low, close, volume, ...]
                const historicalData: CandlestickData[] = data.map((candle: any[]) => ({
                    time: Math.floor(candle[0] / 1000) as any,
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                }));

                const volumeData = data.map((candle: any[]) => {
                    const open = parseFloat(candle[1]);
                    const close = parseFloat(candle[4]);
                    const volume = parseFloat(candle[5]);

                    return {
                        time: Math.floor(candle[0] / 1000) as any,
                        value: volume,
                        color: close >= open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    };
                });

                candlestickSeries.setData(historicalData);
                volumeSeries.setData(volumeData);
                lastCandleRef.current = historicalData[historicalData.length - 1];

                // Fit content nicely
                chart.timeScale().fitContent();
            } catch (error) {
                console.error('Failed to fetch historical data from Binance.US:', error);
            }
        };

        fetchHistoricalData();

        chartRef.current = chart;
        candlestickSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;

        // Handle window resize
        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: chartContainerRef.current.clientHeight
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [timeframe]); // Re-fetch when timeframe changes

    // Update with real-time candle data
    useEffect(() => {
        if (lastCandle && candlestickSeriesRef.current && volumeSeriesRef.current) {
            const candleData: CandlestickData = {
                time: lastCandle.time as any,
                open: lastCandle.open,
                high: lastCandle.high,
                low: lastCandle.low,
                close: lastCandle.close,
            };

            const volumeData = {
                time: lastCandle.time as any,
                value: lastCandle.volume,
                color: lastCandle.close >= lastCandle.open
                    ? 'rgba(16, 185, 129, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)',
            };

            candlestickSeriesRef.current.update(candleData);
            volumeSeriesRef.current.update(volumeData);
            lastCandleRef.current = candleData;
        }
    }, [lastCandle]);

    const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

    // Get user's timezone abbreviation
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneAbbr = new Date().toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop() || 'Local';

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Timeframe Selector - Moved to top for better accessibility */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0B0E11] border-b border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Live</span>
                    </div>
                    <span className="text-gray-600">•</span>
                    <span>BTC/USDT</span>
                    <span className="text-gray-600">•</span>
                    <span className="font-medium text-indigo-400">{timeframe}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500" title={userTimezone}>{timezoneAbbr}</span>
                </div>

                {/* Timeframe buttons */}
                <div className="flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg p-1 border border-gray-800">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${timeframe === tf
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Container */}
            <div ref={chartContainerRef} className="w-full flex-1" />
        </div>
    );
};
