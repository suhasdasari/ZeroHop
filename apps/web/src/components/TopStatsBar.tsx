"use client";

import React, { useState } from 'react';
import { useBinance } from '@/context/BinanceProvider';
import { useYellow } from '@/context/YellowProvider';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { WalletModal } from './WalletModal';

export const TopStatsBar: React.FC = () => {
    const { currentPrice, ticker24h } = useBinance();
    const { balances, isLoadingBalance, isAuthenticated } = useYellow();
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();
    const [showModal, setShowModal] = useState(false);

    // Use real 24h stats from Binance API
    const change24h = ticker24h?.priceChange || 0;
    const changePercent = ticker24h?.priceChangePercent || 0;
    const high24h = ticker24h?.highPrice || 0;
    const low24h = ticker24h?.lowPrice || 0;
    const volume24h = ticker24h ? (ticker24h.quoteVolume / 1000000) : 0; // Convert to millions

    const isPositive = change24h >= 0;

    const handleWalletClick = () => {
        if (isConnected) {
            disconnect();
        } else {
            setShowModal(true);
        }
    };

    return (
        <div className="h-12 bg-[#0B0E11] border-b border-gray-800 flex items-center justify-between px-4 text-sm">
            {/* Left side - Market Stats */}
            <div className="flex items-center gap-6">
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
            </div>

            {/* Right side - Wallet & Balance */}
            <div className="flex items-center gap-4">
                {/* Yellow Network Balance */}
                {isConnected && isAuthenticated && (
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                        {isLoadingBalance ? (
                            <span className="text-xs text-gray-400">Loading balance...</span>
                        ) : balances.length > 0 ? (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">Yellow Balance:</span>
                                {balances.map((balance, idx) => (
                                    <span key={idx} className="text-xs font-medium text-green-400">
                                        {balance.amount} {balance.asset}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">No balance</span>
                        )}
                    </div>
                )}


                {/* Connect Wallet Button */}
                <button
                    onClick={handleWalletClick}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors text-white flex items-center gap-2"
                    title={isConnected ? address : 'Connect Wallet'}
                >
                    {isConnected ? (
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                        </svg>
                    ) : (
                        'Connect Wallet'
                    )}
                </button>
            </div>

            {/* Wallet Modal */}
            <WalletModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </div>
    );
};
