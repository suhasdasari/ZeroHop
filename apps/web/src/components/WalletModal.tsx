"use client";

import React from 'react';
import { useConnect } from 'wagmi';

interface WalletModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
    const { connectors, connect } = useConnect();

    const handleWalletSelect = async (connector: any) => {
        try {
            await connect({ connector });
            onClose();
        } catch (error) {
            console.error('Failed to connect:', error);
        }
    };

    // Only show MetaMask (filter by name)
    const metaMaskConnector = connectors.find(connector =>
        connector.name.toLowerCase().includes('metamask')
    );

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Connect Wallet</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-3">
                    {metaMaskConnector ? (
                        <button
                            onClick={() => handleWalletSelect(metaMaskConnector)}
                            className="w-full p-4 rounded-lg border border-gray-700 hover:border-white transition-colors flex items-center justify-between group"
                        >
                            <span className="font-medium">MetaMask</span>
                            <span className="text-gray-400 group-hover:text-white">→</span>
                        </button>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p className="mb-4">MetaMask not detected</p>
                            <p className="text-sm">Please install MetaMask extension</p>
                            <a
                                href="https://metamask.io/download/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-4 inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Install MetaMask
                            </a>
                        </div>
                    )}
                </div>

                <p className="mt-4 text-sm text-gray-400 text-center">
                    By connecting, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
};
