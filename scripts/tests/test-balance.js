/**
 * Test balance fetching using Yellow Network session
 */

import { YellowSessionManager } from '../core/YellowSessionManager.js';
import { getBalance } from '../actions/getBalance.js';
import { logger } from '../utils/logger.js';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

async function testBalance() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;

    if (!PRIVATE_KEY) {
        logger.error('DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const session = new YellowSessionManager();

    try {
        // Connect and authenticate
        await session.connect(PRIVATE_KEY);

        // Fetch balances
        const balances = await getBalance(session, account.address);

        logger.section('Test Results');
        logger.success('Balance fetch successful!');
        logger.info('Total assets:', balances?.length || 0);

        // Disconnect
        session.disconnect();

    } catch (error) {
        logger.error('Balance test failed:', error.message);
        session.disconnect();
        process.exit(1);
    }
}

testBalance();
