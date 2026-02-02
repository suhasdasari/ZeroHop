/**
 * Get ledger balances from Yellow Network
 */

import { createGetLedgerBalancesMessage } from '@erc7824/nitrolite';
import { logger } from '../utils/logger.js';

/**
 * Fetch ledger balances for a wallet address
 * @param {YellowSessionManager} sessionManager - Active session
 * @param {string} walletAddress - Wallet address to check
 * @returns {Promise<Array>} - Array of balance objects
 */
export async function getBalance(sessionManager, walletAddress) {
    if (!sessionManager.isConnected()) {
        throw new Error('Session not connected. Call connect() first.');
    }

    logger.info('Fetching ledger balances...');

    const ledgerMsg = await createGetLedgerBalancesMessage(
        sessionManager.getSessionSigner(),
        walletAddress,
        Date.now()
    );

    const response = await sessionManager.sendMessage(ledgerMsg, 'get_ledger_balances');

    if (response.res && response.res[1] === 'get_ledger_balances') {
        const balances = response.res[2].ledger_balances;

        logger.success('Balances retrieved:');
        if (balances && balances.length > 0) {
            balances.forEach(item => {
                console.log(`  ${item.asset}: ${item.amount}`);
            });
        } else {
            console.log('  No active balances found.');
        }

        return balances;
    }

    throw new Error('Unexpected response format');
}
