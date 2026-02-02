"use client";

import React from 'react';
import { useBinance } from '@/context/BinanceProvider';

export const TopStatsBar: React.FC = () => {
    const { currentPrice, orderBook } = useBinance();

    // Calculate 24h stats (mock for now - would need historical data)
    const change24h = 1723.45; // Mock
    const changePercent = 2.28; // Mock
    const high24h = 78500; // Mock
    const low24h = 74200; // Mock
    const volume24h = 337.4; // Mock in millions

    const isPositive = change24h >= 0;

    return (
        <div className="h-12 bg-[#0B0E11] border-b border-gray-800 flex items-center px-4 gap-6 text-sm">
            {/* Symbol */}
            <div className="flex items-center gap-2">
                <span className="text-2xl">₿</span>
                <span className="font-bold text-white">BTC</span>
                <span className="text-gray-500">/</span>
                <span className="text-gray-400">USDT</span>
            </div>

            {/* Current Price */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">Mark Price</span>
                <span className="text-lg font-bold text-white">
                    ${currentPrice?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '---'}
                </span>
            </div>

            {/* 24h Change */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">24h Change</span>
                <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{change24h.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
            </div>

            {/* 24h High */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">24h High</span>
                <span className="text-sm text-gray-300">${high24h.toLocaleString()}</span>
            </div>

            {/* 24h Low */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">24h Low</span>
                <span className="text-sm text-gray-300">${low24h.toLocaleString()}</span>
            </div>

            {/* 24h Volume */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">24h Volume</span>
                <span className="text-sm text-gray-300">${volume24h}M</span>
            </div>

            {/* Funding Rate */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">Funding Rate</span>
                <span className="text-sm text-green-400">0.0012%</span>
            </div>

            {/* Next Funding */}
            <div className="flex flex-col">
                <span className="text-xs text-gray-500">Next Funding</span>
                <span className="text-sm text-gray-300">00:33</span>
            </div>
        </div>
    );
};
