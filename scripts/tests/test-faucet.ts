/**
 * Test Yellow Network faucet
 */

import { fundWallet } from '../actions/fundWallet.js';
import { logger } from '../utils/logger.js';
import 'dotenv/config';

async function testFaucet() {
    const ADDRESS = process.env.FAUCET_REQUEST_ADDRESS || process.env.DEV_PRIVATE_KEY;

    if (!ADDRESS) {
        logger.error('FAUCET_REQUEST_ADDRESS or DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    // If it's a private key, convert to address
    let walletAddress = ADDRESS;
    if (ADDRESS.startsWith('0x') && ADDRESS.length === 66) {
        const { privateKeyToAccount } = await import('viem/accounts');
        const account = privateKeyToAccount(ADDRESS as `0x${string}`);
        walletAddress = account.address;
    }

    logger.section('Yellow Network Faucet Test');

    try {
        const result = await fundWallet(walletAddress);

        logger.section('Next Steps');
        logger.info('Run "npm run test:balance" to verify receipt');

    } catch (error) {
        logger.error(`Faucet test failed: ${(error as Error).message}`);
        process.exit(1);
    }
}

testFaucet();
