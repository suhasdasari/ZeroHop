"use client";

import React from 'react';
import { useBinance } from '@/context/BinanceProvider';

export const OrderBook: React.FC = () => {
    const { orderBook } = useBinance();

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-800 font-medium text-sm text-gray-400">Order Book</div>

            {/* Header */}
            <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-800">
                <span>Price (USDT)</span>
                <span className="text-right">Amount (BTC)</span>
                <span className="text-right">Total</span>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {/* Asks (Sell Orders) - Red */}
                <div className="flex flex-col-reverse">
                    {orderBook.asks.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">Loading asks...</div>
                    ) : (
                        orderBook.asks.map((ask, i) => (
                            <div
                                key={`ask-${i}`}
                                className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-gray-800/30 cursor-pointer relative"
                            >
                                {/* Background bar for depth visualization */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-red-500/10"
                                    style={{ width: `${Math.min((ask.total / orderBook.asks[orderBook.asks.length - 1]?.total || 1) * 100, 100)}%` }}
                                />
                                <span className="text-red-400 relative z-10">{ask.price.toFixed(2)}</span>
                                <span className="text-right text-gray-300 relative z-10">{ask.amount.toFixed(5)}</span>
                                <span className="text-right text-gray-400 relative z-10">{ask.total.toFixed(5)}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Current Price Separator */}
                {orderBook.bids.length > 0 && orderBook.asks.length > 0 && (
                    <div className="px-3 py-2 border-y border-gray-800 bg-gray-900/50">
                        <div className="text-lg font-bold text-green-400">
                            {orderBook.bids[0]?.price.toFixed(2) || '---'}
                        </div>
                        <div className="text-xs text-gray-500">Spread: {(orderBook.asks[orderBook.asks.length - 1]?.price - orderBook.bids[0]?.price).toFixed(2)}</div>
                    </div>
                )}

                {/* Bids (Buy Orders) - Green */}
                <div>
                    {orderBook.bids.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-500">Loading bids...</div>
                    ) : (
                        orderBook.bids.map((bid, i) => (
                            <div
                                key={`bid-${i}`}
                                className="grid grid-cols-3 px-3 py-1 text-xs hover:bg-gray-800/30 cursor-pointer relative"
                            >
                                {/* Background bar for depth visualization */}
                                <div
                                    className="absolute right-0 top-0 bottom-0 bg-green-500/10"
                                    style={{ width: `${Math.min((bid.total / orderBook.bids[orderBook.bids.length - 1]?.total || 1) * 100, 100)}%` }}
                                />
                                <span className="text-green-400 relative z-10">{bid.price.toFixed(2)}</span>
                                <span className="text-right text-gray-300 relative z-10">{bid.amount.toFixed(5)}</span>
                                <span className="text-right text-gray-400 relative z-10">{bid.total.toFixed(5)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
