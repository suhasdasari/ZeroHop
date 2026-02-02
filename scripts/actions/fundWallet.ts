/**
 * Request test tokens from Yellow Network faucet
 */

import { YELLOW_CONFIG } from '../core/config.js';
import { logger } from '../utils/logger.js';

interface FaucetResponse {
    success: boolean;
    message: string;
    txId?: string;
    amount?: string;
    asset?: string;
    destination?: string;
}

/**
 * Request tokens from the Yellow Network faucet
 * @param address - Wallet address to fund
 * @returns Faucet response
 */
export async function fundWallet(address: string): Promise<FaucetResponse> {
    logger.info(`Requesting funds for: ${address}`);
    logger.info('Requesting tokens from faucet...');

    const response = await fetch(`${YELLOW_CONFIG.FAUCET_URL}/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        throw new Error(`Faucet request failed: ${response.statusText}`);
    }

    const data = await response.json() as FaucetResponse;

    if (data.success) {
        logger.success('Faucet request successful!');
        logger.info(`Response: ${JSON.stringify(data)}`);
        logger.warn('Note: Tokens are credited to your Unified Balance (off-chain)');
    } else {
        logger.error(`Faucet request failed: ${data.message}`);
    }

    return data;
}
