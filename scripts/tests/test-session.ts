/**
 * Test Yellow Network session creation and authentication
 */

import { YellowSessionManager } from '../core/YellowSessionManager';
import { logger } from '../utils/logger';
import 'dotenv/config';

async function testSession() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY as `0x${string}`;

    if (!PRIVATE_KEY) {
        logger.error('DEV_PRIVATE_KEY is missing in .env');
        process.exit(1);
    }

    const session = new YellowSessionManager();

    try {
        // Test connection and authentication
        await session.connect(PRIVATE_KEY);

        logger.success('Session created successfully!');
        logger.info(`Session Key: ${session.getSessionSigner()}`);
        logger.info(`Is Connected: ${session.isConnected()}`);

        // Keep session alive for 5 seconds
        logger.info('Keeping session alive for 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Disconnect
        session.disconnect();
        logger.success('Session closed successfully!');

    } catch (error) {
        logger.error(`Session test failed: ${(error as Error).message}`);
        process.exit(1);
    }
}

testSession();
