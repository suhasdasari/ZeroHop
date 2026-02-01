'use client'

import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { useState } from 'react'

export default function Home() {
  const { connectors, connect } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showModal, setShowModal] = useState(false)

  const handleConnectClick = () => {
    if (isConnected) {
      disconnect()
    } else {
      setShowModal(true)
    }
  }

  const handleWalletSelect = async (connector: any) => {
    try {
      await connect({ connector })
      setShowModal(false)
    } catch (error) {
      console.error('Failed to connect:', error)
    }
  }

  // Only show MetaMask (filter by name)
  const metaMaskConnector = connectors.find(connector =>
    connector.name.toLowerCase().includes('metamask')
  )

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <header className="flex justify-end">
        <button
          onClick={handleConnectClick}
          className="px-6 py-2 rounded-full border border-white text-white hover:bg-white hover:text-black transition-colors"
        >
          {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <main className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold">Live Trading App</h1>
        {isConnected && (
          <p className="mt-4 text-gray-400">Connected: {address}</p>
        )}
      </main>

      {/* Wallet Selection Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Connect Wallet</h2>
              <button
                onClick={() => setShowModal(false)}
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
      )}
    </div>
  );
}
