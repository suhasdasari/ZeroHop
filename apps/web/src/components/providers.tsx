'use client'

import type { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi'
import { YellowProvider } from '@/context/YellowProvider'
import { BinanceProvider } from '@/context/BinanceProvider'

const queryClient = new QueryClient()

import { Toaster } from 'sonner'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <YellowProvider>
                    <BinanceProvider>
                        {children}
                        <Toaster richColors position="top-right" />
                    </BinanceProvider>
                </YellowProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
