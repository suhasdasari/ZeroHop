/**
 * Shared configuration for Yellow Network integration
 */

export const YELLOW_CONFIG = {
    // Yellow Network WebSocket endpoint
    WS_URL: 'wss://clearnet-sandbox.yellow.com/ws',

    // Session configuration
    SESSION_EXPIRY_HOURS: 1,

    // Default allowances for session
    DEFAULT_ALLOWANCES: [
        {
            asset: 'ytest.usd',
            amount: '10000' // $10,000 max per session
        }
    ],

    // Application scope
    APP_SCOPE: 'zerohop.app',
    APP_NAME: 'ZeroHop Exchange',
};

export const RPC_CONFIG = {
    // Alchemy RPC URL (from env)
    ALCHEMY_URL: process.env.ALCHEMY_RPC_URL,
};
