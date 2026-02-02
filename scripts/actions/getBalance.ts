/**
 * Get ledger balances from Yellow Network
 */

import { createGetLedgerBalancesMessage } from '@erc7824/nitrolite';
import type { YellowSessionManager } from '../core/YellowSessionManager.js';
import { logger } from '../utils/logger.js';

export interface YellowBalance {
    asset: string;
    amount: string;
}

/**
 * Fetch ledger balances for a given address
 * @param session - Active Yellow Network session
 * @param address - Wallet address to fetch balances for
 * @returns Array of balances
 */
export async function getBalance(
    session: YellowSessionManager,
    address: string
): Promise<YellowBalance[]> {
    if (!session.isConnected()) {
        throw new Error('Session not connected. Call session.connect() first.');
    }

    logger.info('Fetching ledger balances...');

    const sessionSigner = session.getSessionSigner();
    const ledgerMsg = await createGetLedgerBalancesMessage(
        sessionSigner,
        address,
        Date.now()
    );

    const response = await session.sendMessage(ledgerMsg, 'get_ledger_balances');

    if (response.res && response.res[1] === 'get_ledger_balances') {
        const balances: YellowBalance[] = response.res[2].ledger_balances || [];

        logger.success('Balances retrieved:');
        balances.forEach(balance => {
            logger.info(`  ${balance.asset}: ${balance.amount}`);
        });

        return balances;
    }

    throw new Error('Unexpected response format');
}
