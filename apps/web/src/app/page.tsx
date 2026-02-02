"use client";

<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useConnect, useAccount, useDisconnect } from 'wagmi'
=======
import React, { useState } from "react";
>>>>>>> 6956063f590eec9020bf2d0b0b68a10fc540accd
import { CandleChart } from '@/components/chart/CandleChart';
import { useYellow } from '@/context/YellowProvider';
import { useBinance } from '@/context/BinanceProvider';
import { OrderBook } from '@/components/OrderBook';
import { TopStatsBar } from '@/components/TopStatsBar';
import { ChartToolbar } from '@/components/ChartToolbar';
import { BottomPanel } from '@/components/BottomPanel';

export default function TradingApp() {
  const [activeTab, setActiveTab] = useState<"market" | "limit">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
<<<<<<< HEAD
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
=======
>>>>>>> 6956063f590eec9020bf2d0b0b68a10fc540accd

  const { createOrder } = useYellow();
  const { lastCandle } = useBinance();

  return (
    <div className="h-screen w-screen bg-[#0B0E11] text-gray-200 font-sans overflow-hidden flex flex-col">
      {/* Top Stats Bar */}
      <TopStatsBar />

      {/* Header */}
      <header className="h-[50px] flex items-center justify-between px-6 border-b border-gray-800 bg-[#0B0E11] shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Spot</span>
        </div>
<<<<<<< HEAD
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
          <button
            onClick={handleConnectClick}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors text-white"
          >
            {mounted && isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
=======
>>>>>>> 6956063f590eec9020bf2d0b0b68a10fc540accd
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chart Toolbar */}
        <ChartToolbar />

        {/* Left Wrapper (Chart + Market View + Bottom Panel) */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Top Row: Chart + Market View */}
          <div className="flex flex-1 min-h-0">
            {/* Left Column: Chart */}
            <main className="flex-1 bg-[#0B0E11] flex flex-col relative border-r border-gray-800">
              {/* Real Candle Chart */}
              <CandleChart lastCandle={lastCandle} />
            </main>

            {/* Middle Column: Order Book */}
            <aside className="w-[300px] flex flex-col border-r border-gray-800 bg-[#0A0E17]">
              <OrderBook />
            </aside>
          </div>

          {/* Bottom Panel */}
          <BottomPanel />
        </div>

        {/* Right Column: Trading Terminal */}
        <aside className="w-[350px] border-l border-gray-800 bg-[#0A0E17] flex flex-col">
          {/* Buy/Sell Toggle */}
          <div className="flex p-2 gap-2 bg-black/20 m-3 rounded-lg border border-gray-800">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${side === 'buy' ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${side === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Sell
            </button>
          </div>

          {/* Market/Limit Tabs */}
          <div className="flex px-4 border-b border-gray-800 mb-4">
            {['Limit', 'Market'].map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type.toLowerCase() as any)}
                className={`mr-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === type.toLowerCase() ? 'border-indigo-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="px-4 flex flex-col gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Price (USDT)</label>
              <input
                type="text"
                defaultValue="0.8495"
                className="w-full bg-[#131722] border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors text-right font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Order Amount (BTC)</label>
              <input
                type="text"
                placeholder="0.00"
                className="w-full bg-[#131722] border border-gray-700 rounded p-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors text-right font-mono"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Available</span>
              <span>0.00 USDT</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-2">
              {[25, 50, 75, 100].map(pct => (
                <button key={pct} className="bg-gray-800 hover:bg-gray-700 text-xs py-1 rounded text-gray-400">{pct}%</button>
              ))}
            </div>

            <button className={`w-full mt-6 py-4 rounded-lg font-bold text-lg shadow-lg transition-transform active:scale-95 ${side === 'buy' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-900/30' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/30'}`}>
              {side === 'buy' ? 'Buy BTC' : 'Sell BTC'}
            </button>
          </div>
        </aside>


      </div>
    </div>
  );
}
