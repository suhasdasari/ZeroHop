/**
 * Test funding wallet with Yellow Network faucet
 */

import { fundWallet } from '../actions/fundWallet.js';
import { logger } from '../utils/logger.js';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

async function testFaucet() {
    logger.section('Yellow Network Faucet Test');

    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;
    const FAUCET_ADDRESS = process.env.FAUCET_REQUEST_ADDRESS;

    // Use FAUCET_REQUEST_ADDRESS if provided, otherwise use wallet from private key
    let targetAddress;

    if (FAUCET_ADDRESS) {
        targetAddress = FAUCET_ADDRESS;
    } else if (PRIVATE_KEY) {
        const account = privateKeyToAccount(PRIVATE_KEY);
        targetAddress = account.address;
    } else {
        logger.error('Either DEV_PRIVATE_KEY or FAUCET_REQUEST_ADDRESS must be set in .env');
        process.exit(1);
    }

    try {
        await fundWallet(targetAddress);

        logger.section('Next Steps');
        logger.info('Run "npm run test:balance-new" to verify receipt');

        process.exit(0);

    } catch (error) {
        logger.error('Faucet test failed:', error.message);
        process.exit(1);
    }
}

testFaucet();
