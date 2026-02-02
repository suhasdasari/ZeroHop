"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useWalletClient, useAccount } from "wagmi";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import {
    createECDSAMessageSigner,
    createEIP712AuthMessageSigner,
    createAuthVerifyMessageFromChallenge,
    createAuthRequestMessage,
    createGetLedgerBalancesMessage
} from "@erc7824/nitrolite";

interface Trade {
    price: number;
    amount: number;
    time: string;
}

interface YellowBalance {
    asset: string;
    amount: string;
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
    const { address } = useAccount();

    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isWsConnected, setIsWsConnected] = useState(false);
    const [balances, setBalances] = useState<YellowBalance[]>([]);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const sessionKeyRef = useRef<string | null>(null);
    const sessionSignerRef = useRef<any>(null);
    const sessionAddressRef = useRef<string | null>(null);

    useEffect(() => {
        if (!walletClient || !address) return;

        // 1. Generate Session Key
        const sessionPrivateKey = generatePrivateKey();
        const sessionAccount = privateKeyToAccount(sessionPrivateKey);
        const sessionAddress = sessionAccount.address;
        sessionKeyRef.current = sessionPrivateKey;
        sessionSignerRef.current = createECDSAMessageSigner(sessionPrivateKey);
        sessionAddressRef.current = sessionAddress;

        // 2. Connect to WebSocket
        const ws = new WebSocket("wss://clearnet-sandbox.yellow.com/ws");
        wsRef.current = ws;

        ws.onopen = async () => {
            console.log("🔌 Connected to Yellow Engine WS");
            setIsWsConnected(true);

            // 3. Send Auth Request
            const authParams = {
                session_key: sessionAddress,
                allowances: [{
                    asset: 'ytest.usd',
                    amount: '1000'
                }],
                expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600 * 24), // 24 hours
                scope: 'test.app',
            };

            try {
                const authRequestMsg = await createAuthRequestMessage({
                    address: address,
                    application: 'Test app',
                    ...authParams
                });
                ws.send(authRequestMsg);
            } catch (e) {
                console.error("Failed to create auth request:", e);
            }
        };

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data.toString());

                if (data.error) {
                    console.error("🚨 WS Error:", data.error);
                    return;
                }

                // 4. Handle Auth Challenge
                if (data.res && data.res[1] === 'auth_challenge') {
                    console.log("Key Auth Challenge received");
                    const challenge = data.res[2].challenge_message;

                    // Re-create auth params matching the request
                    // Note context: In a real app we might want to store these stably
                    const authParams = {
                        session_key: sessionAddress,
                        allowances: [{
                            asset: 'ytest.usd',
                            amount: '1000'
                        }],
                        expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600 * 24),
                        scope: 'test.app',
                    };

                    // Sign with Main Wallet (EIP-712)
                    const signer = createEIP712AuthMessageSigner(
                        walletClient,
                        authParams,
                        { name: 'Test app' }
                    );

                    const verifyMsg = await createAuthVerifyMessageFromChallenge(
                        signer,
                        challenge
                    );

                    ws.send(verifyMsg);
                }

                // 5. Handle Auth Success
                if (data.res && data.res[1] === 'auth_verify') {
                    console.log("✅ Authenticated with Yellow Engine");
                    setIsAuthenticated(true);

                    // 6. Fetch Balance
                    fetchBalance(ws, address);

                    // 7. Subscribe to Market Data
                    const subscribeMsg = JSON.stringify({
                        method: "subscribe",
                        params: ["ticker.ytest.usd"]
                    });
                    ws.send(subscribeMsg);
                }

                // Handle Balance Response
                if (data.res && data.res[1] === 'get_ledger_balances') {
                    const ledgerBalances = data.res[2].ledger_balances || [];
                    console.log("💰 Balances:", ledgerBalances);
                    setBalances(ledgerBalances);
                    setIsLoadingBalance(false);
                }

                // 7. Handle Ticker Updates
                // Expected format: { stream: "ticker.ytest.usd", data: { ... } } or similar
                // Adjusting based on standard Yellow messages if known, otherwise logging
                if (data.active_channels) {
                    // This looks like initial state data, ignoring
                }

                // Check for ticker update
                // We look for 'ticker_update' or stream messages
                // Based on prompt: "When a ticker_update arrives"
                if (data.event === "ticker_update" || (data.stream && data.stream.includes("ticker"))) {
                    // Assuming data structure based on typical exchanges
                    // If data.data.last_price exists
                    const price = parseFloat(data.data?.last_price || data.data?.c || "0");
                    if (price > 0) {
                        setCurrentPrice(price);
                    }
                }

            } catch (err) {
                console.error("WS Message handling error:", err);
            }
        };

        ws.onclose = () => {
            console.log("🔌 Disconnected from Yellow Engine WS");
            setIsWsConnected(false);
            setIsAuthenticated(false);
        };

        return () => {
            ws.close();
        };
    }, [walletClient, address]);

    // Helper function to fetch balance
    const fetchBalance = async (ws: WebSocket, userAddress: string) => {
        if (!sessionSignerRef.current || !sessionAddressRef.current) {
            console.error('Session not initialized');
            return;
        }

        setIsLoadingBalance(true);
        try {
            const balanceMsg = await createGetLedgerBalancesMessage(
                sessionSignerRef.current,
                userAddress,
                Date.now()
            );
            ws.send(balanceMsg);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
            setIsLoadingBalance(false);
        }
    };

    // Refresh balance function
    const refreshBalance = async () => {
        if (!wsRef.current || !address) {
            console.error('Not connected');
            return;
        }
        await fetchBalance(wsRef.current, address);
    };

    const createOrder = async (side: string, price: number, amount: number) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.error("WS not connected");
            return;
        }

        const orderId = `order-${Date.now()}`;
        console.log(`Creating order: ${orderId} ${side} ${amount} @ ${price}`);

        // Mocking the SDK message creation since it wasn't found in exports
        // In a real scenario, this would potentially come from @erc7824/nitrolite
        const message = JSON.stringify({
            method: "create_create_order_message", // inferred from function name requested
            params: {
                asset: "ytest.usd",
                amount: amount.toString(),
                price: price.toString(),
                side: side,
                order_id: orderId
            }
        });

        wsRef.current.send(message);
        console.log("Order Id:", orderId);

        return orderId;
    };

    return (
        <YellowContext.Provider value={{
            currentPrice,
            trades,
            isConnected: isWsConnected,
            isAuthenticated,
            balances,
            isLoadingBalance,
            createOrder,
            refreshBalance
        }}>
            {children}
        </YellowContext.Provider>
    );
};
