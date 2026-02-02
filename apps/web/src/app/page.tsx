"use client";

import React, { useState } from "react";
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

        {/* Far Right Utility Bar */}
        <aside className="w-[60px] border-l border-gray-800 bg-[#0A0E17] flex flex-col items-center py-4 gap-6">
          {/* Icons using simplified SVG placeholders */}
          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
        </aside>
      </div>
    </div>
  );
}
