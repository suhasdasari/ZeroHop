"use client";

import React from 'react';
import { useBinance } from '@/context/BinanceProvider';

export const OrderBook: React.FC = () => {
    const { orderBook } = useBinance();
    const asksContainerRef = React.useRef<HTMLDivElement>(null);

    // Show more depth and auto-scroll to bottom of asks (closest to price)
    const asks = orderBook.asks.slice(0, 50).reverse();
    const bids = orderBook.bids.slice(0, 50);

    // Auto-scroll asks to bottom on load/update
    React.useEffect(() => {
        if (asksContainerRef.current) {
            asksContainerRef.current.scrollTop = asksContainerRef.current.scrollHeight;
        }
    }, [asks.length, orderBook.asks]); // Dependency on data updates

    // Calculate max total for depth visualization
    const maxTotal = Math.max(
        ...asks.map((ask) => ask.total),
        ...bids.map((bid) => bid.total),
        1
    );

    const renderRow = (item: { price: number; amount: number; total: number }, isBid: boolean) => {
        const depthPercent = (item.total / maxTotal) * 100;

        return (
            <div
                key={`${item.price}-${item.amount}`}
                className="relative grid grid-cols-3 px-3 py-1 text-xs hover:bg-gray-800/50 cursor-pointer group"
            >
                {/* Depth bar */}
                <div
                    className={`absolute right-0 top-0 h-full ${isBid ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}
                    style={{ width: `${depthPercent}%` }}
                />

                {/* Content */}
                <span className={`relative z-10 font-medium ${isBid ? 'text-green-400' : 'text-red-400'}`}>
                    {item.price.toFixed(2)}
                </span>
                <span className="relative z-10 text-right text-gray-300">
                    {item.amount.toFixed(5)}
                </span>
                <span className="relative z-10 text-right text-gray-400">
                    {item.total.toFixed(2)}
                </span>
            </div>
        );
    };

    // Calculate spread
    const spread = asks.length > 0 && bids.length > 0
        ? asks[asks.length - 1].price - bids[0].price // Asks are reversed, last item is lowest asking price
        : 0;
    const spreadPercent = bids.length > 0 && spread > 0
        ? (spread / bids[0].price) * 100
        : 0;

    return (
        <div className="flex flex-col h-full bg-[#0B0E11]">
            {/* Header */}
            <div className="px-3 py-3 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-white">Order Book</h3>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-3 px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-800">
                <span>Price (USDT)</span>
                <span className="text-right">Amount (BTC)</span>
                <span className="text-right">Total</span>
            </div>

            {/* Asks (Sell Orders) */}
            <div
                ref={asksContainerRef}
                className="flex-1 overflow-y-auto scrollbar-hide"
            >
                {asks.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">Loading asks...</div>
                ) : (
                    asks.map((ask) => renderRow(ask, false))
                )}
            </div>

            {/* Spread */}
            <div className="px-3 py-2 bg-gray-900/50 border-y border-gray-800">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Spread</span>
                    <span className="text-gray-300 font-medium">
                        {spread > 0
                            ? `${spread.toFixed(2)} (${spreadPercent.toFixed(3)}%)`
                            : '---'}
                    </span>
                </div>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {bids.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">Loading bids...</div>
                ) : (
                    bids.map((bid) => renderRow(bid, true))
                )}
            </div>
        </div>
    );
};
