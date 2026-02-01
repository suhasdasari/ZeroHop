"use client";

import React from 'react';
import { useBinance } from '@/context/BinanceProvider';

export const RecentTrades: React.FC = () => {
    const { trades } = useBinance();

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-800 font-medium text-sm text-gray-400">Recent Trades</div>

            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-800">
                <span>Price (USDT)</span>
                <span className="text-right">Amount (BTC)</span>
                <span className="text-right">Time</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {trades.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">Waiting for trades...</div>
                ) : (
                    trades.map((trade, i) => (
                        <div
                            key={i}
                            className="grid grid-cols-3 px-3 py-1.5 text-xs hover:bg-gray-800/30 cursor-pointer"
                        >
                            <span className={trade.isBuyerMaker ? 'text-red-400' : 'text-green-400'}>
                                {trade.price.toFixed(2)}
                            </span>
                            <span className="text-right text-gray-300">{trade.amount.toFixed(5)}</span>
                            <span className="text-right text-gray-400">{trade.time}</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
