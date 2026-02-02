/**
 * Test complete Yellow Network trading flow
 * Demonstrates persistent session usage across multiple operations
 */

import { YellowSessionManager } from '../core/YellowSessionManager.js';
import { getBalance } from '../actions/getBalance.js';
import { placeOrder } from '../actions/placeOrder.js';
import { logger } from '../utils/logger.js';
import 'dotenv/config';

async function testFullFlow() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY as `0x${string}`;

    if (!PRIVATE_KEY) {
        logger.error('DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    const session = new YellowSessionManager();

    try {
        // Step 1: Connect & Authenticate
        logger.section('Step 1: Connect & Authenticate');
        await session.connect(PRIVATE_KEY);

        // Get wallet address
        const { privateKeyToAccount } = await import('viem/accounts');
        const account = privateKeyToAccount(PRIVATE_KEY);

        // Step 2: Check Initial Balance
        logger.section('Step 2: Check Initial Balance');
        const initialBalances = await getBalance(session, account.address);

        // Step 3: Place Order
        logger.section('Step 3: Place Order');
        const orderParams = {
            side: 'buy' as const,
            symbol: 'BTC/USDT',
            amount: '0.001',
            price: '77000',
            type: 'limit' as const,
        };
        const order = await placeOrder(session, orderParams);
        logger.info(`Order placed: ${JSON.stringify(order)}`);

        // Step 4: Check Balance After Order
        logger.section('Step 4: Check Balance After Order');
        const finalBalances = await getBalance(session, account.address);

        // Summary
        logger.section('Test Summary');
        logger.success('Full flow test completed!');
        logger.info('Session was maintained throughout all operations');

        // Disconnect
        logger.info('Disconnecting from Yellow Network...');
        session.disconnect();

    } catch (error) {
        logger.error(`Full flow test failed: ${(error as Error).message}`);
        session.disconnect();
        process.exit(1);
    }
}

testFullFlow();
