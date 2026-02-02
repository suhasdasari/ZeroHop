/**
 * Yellow Network Session Manager
 * Handles WebSocket connection, authentication, and session lifecycle
 */

import {
    createECDSAMessageSigner,
    createEIP712AuthMessageSigner,
    createAuthVerifyMessageFromChallenge,
    createAuthRequestMessage
} from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import WebSocket from 'ws';
import { YELLOW_CONFIG, RPC_CONFIG } from './config.js';
import { logger } from '../utils/logger.js';

export class YellowSessionManager {
    constructor() {
        this.ws = null;
        this.sessionKey = null;
        this.sessionSigner = null;
        this.isAuthenticated = false;
        this.messageHandlers = new Map();
        this.messageId = 0;
    }

    /**
     * Connect to Yellow Network and authenticate
     * @param {string} privateKey - User's wallet private key
     * @returns {Promise<void>}
     */
    async connect(privateKey) {
        logger.section('Yellow Network Session');

        // Setup wallet
        const account = privateKeyToAccount(privateKey);
        logger.info('Wallet Address:', account.address);

        const publicClient = createPublicClient({
            chain: sepolia,
            transport: http(RPC_CONFIG.ALCHEMY_URL),
        });

        const walletClient = createWalletClient({
            chain: sepolia,
            transport: http(),
            account,
        });

        // Generate session key
        const sessionPrivateKey = generatePrivateKey();
        const sessionAccount = privateKeyToAccount(sessionPrivateKey);
        this.sessionKey = sessionAccount.address;
        this.sessionSigner = createECDSAMessageSigner(sessionPrivateKey);

        logger.info('Session Key:', this.sessionKey);

        // Connect to WebSocket
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(YELLOW_CONFIG.WS_URL);

            const authParams = {
                session_key: this.sessionKey,
                allowances: YELLOW_CONFIG.DEFAULT_ALLOWANCES,
                expires_at: BigInt(Math.floor(Date.now() / 1000) + (YELLOW_CONFIG.SESSION_EXPIRY_HOURS * 3600)),
                scope: YELLOW_CONFIG.APP_SCOPE,
            };

            this.ws.on('open', async () => {
                logger.success('Connected to Yellow Network');

                const authRequestMsg = await createAuthRequestMessage({
                    address: account.address,
                    application: YELLOW_CONFIG.APP_NAME,
                    ...authParams
                });

                this.ws.send(authRequestMsg);
            });

            // CRITICAL: This message handler must persist for the entire session
            this.ws.on('message', async (data) => {
                try {
                    const response = JSON.parse(data.toString());

                    // Debug logging
                    logger.debug('Received message:', JSON.stringify(response, null, 2));

                    if (response.error) {
                        logger.error('RPC Error:', response.error);
                        // If we're still in auth phase, reject the connect promise
                        if (!this.isAuthenticated) {
                            reject(new Error(response.error.message));
                        }
                        return;
                    }

                    // Handle auth challenge
                    if (response.res && response.res[1] === 'auth_challenge') {
                        if (this.isAuthenticated) return;

                        logger.info('Received auth challenge, signing...');
                        const challenge = response.res[2].challenge_message;

                        const signer = createEIP712AuthMessageSigner(
                            walletClient,
                            authParams,
                            { name: YELLOW_CONFIG.APP_NAME }
                        );

                        const verifyMsg = await createAuthVerifyMessageFromChallenge(
                            signer,
                            challenge
                        );

                        this.ws.send(verifyMsg);
                        return;
                    }

                    // Handle auth success
                    if (response.res && response.res[1] === 'auth_verify') {
                        logger.success('Authenticated successfully!');
                        this.isAuthenticated = true;
                        resolve(); // Resolve the connect() promise
                        return;
                    }

                    // Handle all other responses (balance, orders, etc.)
                    // Yellow Network uses res[1] to identify message types
                    if (response.res && response.res[1]) {
                        const responseType = response.res[1];
                        if (this.messageHandlers.has(responseType)) {
                            const handler = this.messageHandlers.get(responseType);
                            handler(response);
                            this.messageHandlers.delete(responseType);
                        }
                    }

                } catch (error) {
                    logger.error('Error handling message:', error);
                    if (!this.isAuthenticated) {
                        reject(error);
                    }
                }
            });

            this.ws.on('error', (err) => {
                logger.error('WebSocket Error:', err);
                reject(err);
            });

            this.ws.on('close', () => {
                logger.warn('WebSocket connection closed');
                this.isAuthenticated = false;
            });
        });
    }

    /**
     * Send a message and wait for response
     * @param {string} message - JSON-RPC message to send
     * @param {string} expectedResponseType - Expected response type (e.g., 'get_ledger_balances' or the message ID for JSON-RPC)
     * @returns {Promise<any>}
     */
    sendMessage(message, expectedResponseType) {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            try {
                // Register handler for this message type
                this.messageHandlers.set(expectedResponseType, (response) => {
                    if (response.error) {
                        reject(new Error(response.error.message));
                    } else {
                        resolve(response);
                    }
                });

                // Set timeout in case response never comes
                const timeout = setTimeout(() => {
                    if (this.messageHandlers.has(expectedResponseType)) {
                        this.messageHandlers.delete(expectedResponseType);
                        reject(new Error(`Timeout waiting for response: ${expectedResponseType}`));
                    }
                }, 30000); // 30 second timeout

                // Clear timeout when response is received
                const originalHandler = this.messageHandlers.get(expectedResponseType);
                this.messageHandlers.set(expectedResponseType, (response) => {
                    clearTimeout(timeout);
                    originalHandler(response);
                });

                this.ws.send(message);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from Yellow Network
     */
    disconnect() {
        if (this.ws) {
            logger.info('Disconnecting from Yellow Network...');
            this.ws.close();
            this.ws = null;
            this.isAuthenticated = false;
            this.sessionKey = null;
            this.sessionSigner = null;
        }
    }

    /**
     * Check if session is authenticated
     * @returns {boolean}
     */
    isConnected() {
        return this.isAuthenticated && this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Get session key address
     * @returns {string|null}
     */
    getSessionKey() {
        return this.sessionKey;
    }

    /**
     * Get session signer
     * @returns {object|null}
     */
    getSessionSigner() {
        return this.sessionSigner;
    }
}
