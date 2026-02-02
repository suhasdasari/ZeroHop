/**
 * Yellow Network configuration
 */

export const YELLOW_CONFIG = {
    WS_URL: 'wss://clearnet-sandbox.yellow.com/ws',
    FAUCET_URL: 'https://clearnet-sandbox.yellow.com/faucet',
    SESSION_EXPIRY_HOURS: 1,
    DEFAULT_ALLOWANCES: [
        {
            asset: 'ytest.usd',
            amount: '10000'
        }
    ],
    APP_SCOPE: 'zerohop.app',
    APP_NAME: 'ZeroHop Exchange',
    REQUEST_TIMEOUT: 30000, // 30 seconds
} as const;

export type YellowConfig = typeof YELLOW_CONFIG;
