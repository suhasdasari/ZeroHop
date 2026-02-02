/**
 * Test Yellow Network balance fetching
 */

import { YellowSessionManager } from '../core/YellowSessionManager';
import { getBalance } from '../actions/getBalance';
import { logger } from '../utils/logger';
import 'dotenv/config';

async function testBalance() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY as `0x${string}`;

    if (!PRIVATE_KEY) {
        logger.error('DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    const session = new YellowSessionManager();

    try {
        // Connect and authenticate
        await session.connect(PRIVATE_KEY);

        // Get wallet address from private key
        const { privateKeyToAccount } = await import('viem/accounts');
        const account = privateKeyToAccount(PRIVATE_KEY);

        // Fetch balance
        const balances = await getBalance(session, account.address);

        logger.section('Test Results');
        logger.success('Balance fetch successful!');
        logger.info(`Total assets: ${balances.length}`);

        // Disconnect
        logger.info('Disconnecting from Yellow Network...');
        session.disconnect();

    } catch (error) {
        logger.error(`Balance test failed: ${(error as Error).message}`);
        session.disconnect();
        process.exit(1);
    }
}

testBalance();
