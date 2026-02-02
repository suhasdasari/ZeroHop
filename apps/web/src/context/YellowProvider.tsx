"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { YellowSessionManager } from "@scripts/core/YellowSessionManager";
import { getBalance, type YellowBalance } from "@scripts/actions/getBalance";

interface Trade {
    price: number;
    amount: number;
    time: string;
}

interface YellowContextType {
    currentPrice: number | null;
    trades: Trade[];
    isConnected: boolean;
    isAuthenticated: boolean;
    balances: YellowBalance[];
    isLoadingBalance: boolean;
    createOrder: (side: string, price: number, amount: number) => Promise<string | undefined>;
    refreshBalance: () => Promise<void>;
}

const YellowContext = createContext<YellowContextType>({
    currentPrice: null,
    trades: [],
    isConnected: false,
    isAuthenticated: false,
    balances: [],
    isLoadingBalance: false,
    createOrder: async () => undefined,
    refreshBalance: async () => { },
});

export const useYellow = () => useContext(YellowContext);

export const YellowProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: walletClient } = useWalletClient();
    const { address, isConnected: walletIsConnected } = useAccount();

    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [balances, setBalances] = useState<YellowBalance[]>([]);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const sessionManagerRef = useRef<YellowSessionManager | null>(null);

    // Auto-connect when wallet connects
    useEffect(() => {
        if (!walletClient || !address || !walletIsConnected) {
            // Cleanup if wallet disconnects
            if (sessionManagerRef.current) {
                sessionManagerRef.current.disconnect();
                sessionManagerRef.current = null;
                setIsAuthenticated(false);
                setBalances([]);
            }
            return;
        }

        // Connect to Yellow Network
        const connectYellow = async () => {
            try {
                console.log("🔌 Connecting to Yellow Network...");
                console.log("Wallet Client:", walletClient);
                console.log("Address:", address);

                // Create session manager
                const session = new YellowSessionManager();
                sessionManagerRef.current = session;
                console.log("✅ Session manager created");

                // Connect and authenticate (using WalletClient)
                console.log("📡 Calling session.connect()...");
                await session.connect(walletClient);
                console.log("✅ Session connected");

                setIsAuthenticated(true);
                console.log("✅ Yellow Network authenticated!");

                // Fetch initial balance
                console.log("💰 Fetching balance...");
                await fetchBalance();
                console.log("✅ Balance fetched");

            } catch (error) {
                console.error("❌ Yellow Network connection failed:", error);
                console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
                setIsAuthenticated(false);
            }
        };

        connectYellow();

        // Cleanup on unmount
        return () => {
            if (sessionManagerRef.current) {
                sessionManagerRef.current.disconnect();
            }
        };
    }, [walletClient, address, walletIsConnected]);

    // Fetch balance using the imported getBalance function
    const fetchBalance = async () => {
        if (!sessionManagerRef.current || !address) return;

        try {
            setIsLoadingBalance(true);
            const balanceData = await getBalance(sessionManagerRef.current, address);
            setBalances(balanceData);
        } catch (error) {
            console.error("Failed to fetch balance:", error);
            setBalances([]);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // Refresh balance (public API)
    const refreshBalance = async () => {
        await fetchBalance();
    };

    // Create order (placeholder)
    const createOrder = async (side: string, price: number, amount: number): Promise<string | undefined> => {
        if (!sessionManagerRef.current) {
            console.error("Not authenticated with Yellow Network");
            return undefined;
        }

        console.log("Creating order:", { side, price, amount });
        // TODO: Implement order placement using Yellow Network SDK
        return undefined;
    };

    return (
        <YellowContext.Provider
            value={{
                currentPrice,
                trades,
                isConnected: walletIsConnected && isAuthenticated,
                isAuthenticated,
                balances,
                isLoadingBalance,
                createOrder,
                refreshBalance,
            }}
        >
            {children}
        </YellowContext.Provider>
    );
};
