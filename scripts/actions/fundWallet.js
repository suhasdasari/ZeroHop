/**
 * Fund wallet using Yellow Network faucet
 */

import { logger } from '../utils/logger.js';
import 'dotenv/config';

/**
 * Request test tokens from Yellow Network faucet
 * @param {string} walletAddress - Address to receive tokens
 * @returns {Promise<void>}
 */
export async function fundWallet(walletAddress) {
    logger.info(`Requesting funds for: ${walletAddress}`);

    const FAUCET_URL = 'https://clearnet-sandbox.yellow.com/faucet/requestTokens';

    try {
        logger.info(`Requesting tokens from faucet...`);

        const response = await fetch(FAUCET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userAddress: walletAddress })
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
        }

        logger.success('Faucet request successful!');
        logger.info(`Response: ${text}`);
        logger.warn('Note: Tokens are credited to your Unified Balance (off-chain)');

        return text;

    } catch (error) {
        logger.error('Faucet request failed:', error.message);
        throw error;
    }
}
