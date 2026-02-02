"use client";

import React, { useState } from 'react';

type Tool = 'cursor' | 'crosshair' | 'trendline' | 'horizontal' | 'vertical' | 'rectangle';

export const ChartToolbar: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool>('cursor');

    const tools = [
        { id: 'cursor' as Tool, icon: '⌖', label: 'Cursor' },
        { id: 'crosshair' as Tool, icon: '✛', label: 'Crosshair' },
        { id: 'trendline' as Tool, icon: '⟋', label: 'Trend Line' },
        { id: 'horizontal' as Tool, icon: '─', label: 'Horizontal Line' },
        { id: 'vertical' as Tool, icon: '│', label: 'Vertical Line' },
        { id: 'rectangle' as Tool, icon: '▭', label: 'Rectangle' },
    ];

    return (
        <div className="w-12 bg-[#0B0E11] border-r border-gray-800 flex flex-col items-center py-4 gap-2">
            {tools.map((tool) => (
                <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-9 h-9 flex items-center justify-center rounded transition-all group relative ${activeTool === tool.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                    title={tool.label}
                >
                    <span className="text-lg">{tool.icon}</span>

                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                        {tool.label}
                    </div>
                </button>
            ))}

            {/* Divider */}
            <div className="w-6 h-px bg-gray-800 my-2"></div>

            {/* Settings */}
            <button
                className="w-9 h-9 flex items-center justify-center rounded text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                title="Chart Settings"
            >
                <span className="text-lg">⚙</span>
            </button>
        </div>
    );
};
