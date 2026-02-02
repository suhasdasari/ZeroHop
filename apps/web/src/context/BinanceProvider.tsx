"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface Trade {
    price: number;
    amount: number;
    time: string;
    isBuyerMaker: boolean;
}

interface OrderBookLevel {
    price: number;
    amount: number;
    total: number;
}

interface OrderBook {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
}

interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface Ticker24h {
    priceChange: number;
    priceChangePercent: number;
    highPrice: number;
    lowPrice: number;
    volume: number;
    quoteVolume: number;
}

interface BinanceContextType {
    currentPrice: number | null;
    trades: Trade[];
    orderBook: OrderBook;
    lastCandle: Candle | null;
    ticker24h: Ticker24h | null;
    isConnected: boolean;
}

const BinanceContext = createContext<BinanceContextType>({
    currentPrice: null,
    trades: [],
    orderBook: { bids: [], asks: [] },
    lastCandle: null,
    ticker24h: null,
    isConnected: false,
});

export const useBinance = () => useContext(BinanceContext);

export const BinanceProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
    const [lastCandle, setLastCandle] = useState<Candle | null>(null);
    const [ticker24h, setTicker24h] = useState<Ticker24h | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const wsTradeRef = useRef<WebSocket | null>(null);
    const wsDepthRef = useRef<WebSocket | null>(null);
    const wsKlineRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Fetch initial price immediately
        const fetchInitialPrice = async () => {
            try {
                const response = await fetch('/api/binance/api/v3/ticker/price?symbol=BTCUSDT');
                const data = await response.json();
                if (data.price) {
                    setCurrentPrice(parseFloat(data.price));
                }
            } catch (error) {
                console.error('Failed to fetch initial price:', error);
            }
        };

        // Fetch 24h ticker statistics
        const fetch24hStats = async () => {
            try {
                const response = await fetch('/api/binance/api/v3/ticker/24hr?symbol=BTCUSDT');
                const data = await response.json();
                if (data) {
                    setTicker24h({
                        priceChange: parseFloat(data.priceChange),
                        priceChangePercent: parseFloat(data.priceChangePercent),
                        highPrice: parseFloat(data.highPrice),
                        lowPrice: parseFloat(data.lowPrice),
                        volume: parseFloat(data.volume),
                        quoteVolume: parseFloat(data.quoteVolume),
                    });
                }
            } catch (error) {
                console.error('Failed to fetch 24h stats:', error);
            }
        };

        fetchInitialPrice();
        fetch24hStats();

        // Refresh 24h stats every minute
        const statsInterval = setInterval(fetch24hStats, 60000);

        // Connect to Binance.US WebSocket streams
        const connectWebSockets = () => {
            // 1. Trade Stream - for live price and recent trades
            const wsTrade = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@trade');
            wsTradeRef.current = wsTrade;

            wsTrade.onopen = () => {
                console.log('🔌 Connected to Binance.US Trade Stream');
                setIsConnected(true);
            };

            wsTrade.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.e === 'trade') {
                        const price = parseFloat(data.p);
                        const amount = parseFloat(data.q);
                        const timestamp = new Date(data.T);

                        setCurrentPrice(price);

                        const newTrade: Trade = {
                            price,
                            amount,
                            time: timestamp.toLocaleTimeString(),
                            isBuyerMaker: data.m,
                        };

                        setTrades(prev => [newTrade, ...prev].slice(0, 50));
                    }
                } catch (err) {
                    console.error('Trade stream error:', err);
                }
            };

            wsTrade.onerror = (error) => {
                console.error('Trade WebSocket error:', error);
                setIsConnected(false);
            };

            wsTrade.onclose = () => {
                console.log('🔌 Disconnected from Binance.US Trade Stream');
                setIsConnected(false);
                // Reconnect after 5 seconds
                setTimeout(connectWebSockets, 5000);
            };

            // 2. Depth Stream - for orderbook
            const wsDepth = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@depth20@100ms');
            wsDepthRef.current = wsDepth;

            wsDepth.onopen = () => {
                console.log('🔌 Connected to Binance.US Depth Stream');
            };

            wsDepth.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.bids && data.asks) {
                        const bids: OrderBookLevel[] = data.bids.slice(0, 20).map((bid: string[], index: number) => {
                            const price = parseFloat(bid[0]);
                            const amount = parseFloat(bid[1]);
                            const total = data.bids.slice(0, index + 1).reduce((sum: number, b: string[]) => sum + parseFloat(b[1]), 0);
                            return { price, amount, total };
                        });

                        const asks: OrderBookLevel[] = data.asks.slice(0, 20).map((ask: string[], index: number) => {
                            const price = parseFloat(ask[0]);
                            const amount = parseFloat(ask[1]);
                            const total = data.asks.slice(0, index + 1).reduce((sum: number, a: string[]) => sum + parseFloat(a[1]), 0);
                            return { price, amount, total };
                        });

                        setOrderBook({ bids, asks: asks.reverse() });
                    }
                } catch (err) {
                    console.error('Depth stream error:', err);
                }
            };

            wsDepth.onerror = (error) => {
                console.error('Depth WebSocket error:', error);
            };

            wsDepth.onclose = () => {
                console.log('🔌 Disconnected from Binance.US Depth Stream');
                // Reconnect after 5 seconds
                setTimeout(() => {
                    const wsDepthReconnect = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@depth20@100ms');
                    wsDepthRef.current = wsDepthReconnect;
                    wsDepthReconnect.onopen = wsDepth.onopen;
                    wsDepthReconnect.onmessage = wsDepth.onmessage;
                    wsDepthReconnect.onerror = wsDepth.onerror;
                    wsDepthReconnect.onclose = wsDepth.onclose;
                }, 5000);
            };

            // 3. Kline Stream - for candlestick data
            const wsKline = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@kline_1m');
            wsKlineRef.current = wsKline;

            wsKline.onopen = () => {
                console.log('🔌 Connected to Binance.US Kline Stream');
            };

            wsKline.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.e === 'kline' && data.k) {
                        const k = data.k;
                        const candle: Candle = {
                            time: Math.floor(k.t / 1000),
                            open: parseFloat(k.o),
                            high: parseFloat(k.h),
                            low: parseFloat(k.l),
                            close: parseFloat(k.c),
                            volume: parseFloat(k.v),
                        };
                        setLastCandle(candle);
                    }
                } catch (err) {
                    console.error('Kline stream error:', err);
                }
            };

            wsKline.onerror = (error) => {
                console.error('Kline WebSocket error:', error);
            };

            wsKline.onclose = () => {
                console.log('🔌 Disconnected from Binance.US Kline Stream');
                // Reconnect after 5 seconds
                setTimeout(() => {
                    const wsKlineReconnect = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@kline_1m');
                    wsKlineRef.current = wsKlineReconnect;
                    wsKlineReconnect.onopen = wsKline.onopen;
                    wsKlineReconnect.onmessage = wsKline.onmessage;
                    wsKlineReconnect.onerror = wsKline.onerror;
                    wsKlineReconnect.onclose = wsKline.onclose;
                }, 5000);
            };
        };

        connectWebSockets();

        // Cleanup on unmount
        return () => {
            clearInterval(statsInterval);
            wsTradeRef.current?.close();
            wsDepthRef.current?.close();
            wsKlineRef.current?.close();
        };
    }, []);

    return (
        <BinanceContext.Provider value={{ currentPrice, trades, orderBook, lastCandle, ticker24h, isConnected }}>
            {children}
        </BinanceContext.Provider>
    );
};
