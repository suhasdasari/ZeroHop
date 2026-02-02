/**
 * Test complete trading flow:
 * 1. Connect & authenticate
 * 2. Check balance
 * 3. Place order (placeholder)
 * 4. Check balance again
 * 5. Disconnect
 */

import { YellowSessionManager } from '../core/YellowSessionManager.js';
import { getBalance } from '../actions/getBalance.js';
import { placeOrder } from '../actions/placeOrder.js';
import { logger } from '../utils/logger.js';
import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

async function testFullFlow() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;

    if (!PRIVATE_KEY) {
        logger.error('DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    const session = new YellowSessionManager();

    try {
        // Step 1: Connect
        logger.section('Step 1: Connect & Authenticate');
        await session.connect(PRIVATE_KEY);

        // Step 2: Check initial balance
        logger.section('Step 2: Check Initial Balance');
        const initialBalance = await getBalance(session, account.address);

        // Step 3: Place order (placeholder)
        logger.section('Step 3: Place Order');
        const order = await placeOrder(session, {
            side: 'buy',
            symbol: 'BTC/USDT',
            amount: '0.001',
            price: '77000',
            type: 'limit'
        });
        logger.info('Order placed:', order);

        // Step 4: Check balance again
        logger.section('Step 4: Check Balance After Order');
        const finalBalance = await getBalance(session, account.address);

        // Step 5: Summary
        logger.section('Test Summary');
        logger.success('Full flow test completed!');
        logger.info('Session was maintained throughout all operations');

        // Disconnect
        session.disconnect();

    } catch (error) {
        logger.error('Full flow test failed:', error.message);
        session.disconnect();
        process.exit(1);
    }
}

testFullFlow();
