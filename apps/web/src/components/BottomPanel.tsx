"use client";

import React, { useState } from 'react';

type Tab = 'positions' | 'orders' | 'history' | 'trades';

export const BottomPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('positions');

    const tabs: { id: Tab; label: string }[] = [
        { id: 'positions', label: 'Open Positions' },
        { id: 'orders', label: 'Open Orders' },
        { id: 'history', label: 'Order History' },
        { id: 'trades', label: 'Trade History' },
    ];

    return (
        <div className="h-[200px] border-t border-gray-800 bg-[#0B0E11] flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5'
                                : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {activeTab === 'positions' && (
                    <div className="p-6 flex items-center justify-center text-gray-500 text-sm">
                        <div className="text-center">
                            <div className="text-gray-600 mb-2">📊</div>
                            <div>No open positions</div>
                            <div className="text-xs text-gray-600 mt-1">Your positions will appear here</div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="p-6 flex items-center justify-center text-gray-500 text-sm">
                        <div className="text-center">
                            <div className="text-gray-600 mb-2">📝</div>
                            <div>No open orders</div>
                            <div className="text-xs text-gray-600 mt-1">Your active orders will appear here</div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="p-6 flex items-center justify-center text-gray-500 text-sm">
                        <div className="text-center">
                            <div className="text-gray-600 mb-2">📜</div>
                            <div>No order history</div>
                            <div className="text-xs text-gray-600 mt-1">Your completed orders will appear here</div>
                        </div>
                    </div>
                )}

                {activeTab === 'trades' && (
                    <div className="p-6 flex items-center justify-center text-gray-500 text-sm">
                        <div className="text-center">
                            <div className="text-gray-600 mb-2">💱</div>
                            <div>No trade history</div>
                            <div className="text-xs text-gray-600 mt-1">Your executed trades will appear here</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
