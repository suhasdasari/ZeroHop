/**
 * Yellow Network Session Manager
 * Handles WebSocket connection, authentication, and session lifecycle
 * Works in both Node.js and browser environments
 */

import {
    createECDSAMessageSigner,
    createEIP712AuthMessageSigner,
    createAuthVerifyMessageFromChallenge,
    createAuthRequestMessage
} from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http, type WalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount, generatePrivateKey, type PrivateKeyAccount } from 'viem/accounts';
import { YELLOW_CONFIG } from './config';
import { logger } from '../utils/logger';

// WebSocket type that works in both Node.js and browser
type WebSocketType = WebSocket | any;

// Dynamic WebSocket import for Node.js
let WSConstructor: any;
if (typeof window !== 'undefined' && typeof window !== undefined) {
    // Browser environment
    WSConstructor = WebSocket;
} else {
    // Node.js environment
    const ws = await import('ws');
    WSConstructor = ws.default;
}

interface AuthParams {
    session_key: string;
    allowances: Array<{ asset: string; amount: string }>;
    expires_at: bigint;
    scope: string;
}

interface YellowResponse {
    res?: [number, string, any];
    error?: {
        code: number;
        message: string;
    };
    id?: number;
}

export class YellowSessionManager {
    private ws: WebSocketType | null = null;
    private sessionKey: string | null = null;
    private sessionSigner: any = null;
    private isAuthenticated: boolean = false;
    private messageHandlers: Map<string, (response: YellowResponse) => void> = new Map();
    private messageId: number = 0;

    /**
     * Connect to Yellow Network and authenticate
     * @param privateKeyOrWallet - User's wallet private key (0x...) or WalletClient
     * @returns Promise that resolves when authenticated
     */
    async connect(privateKeyOrWallet: `0x${string}` | WalletClient): Promise<void> {
        logger.section('Yellow Network Session');

        let walletClient: WalletClient;
        let account: PrivateKeyAccount;

        // Handle both private key and wallet client
        if (typeof privateKeyOrWallet === 'string') {
            // Private key provided (Node.js scripts)
            account = privateKeyToAccount(privateKeyOrWallet);
            logger.info(`Wallet Address: ${account.address}`);

            const rpcUrl = process.env.ALCHEMY_RPC_URL;
            if (!rpcUrl) {
                throw new Error('ALCHEMY_RPC_URL not found in environment');
            }

            walletClient = createWalletClient({
                chain: sepolia,
                transport: http(rpcUrl),
                account,
            });
        } else {
            // WalletClient provided (browser)
            walletClient = privateKeyOrWallet;
            if (!walletClient.account) {
                throw new Error('WalletClient must have an account');
            }
            account = walletClient.account as PrivateKeyAccount;
            logger.info(`Wallet Address: ${account.address}`);
        }

        // Generate session key
        const sessionPrivateKey = generatePrivateKey();
        const sessionAccount = privateKeyToAccount(sessionPrivateKey);
        this.sessionKey = sessionAccount.address;
        this.sessionSigner = createECDSAMessageSigner(sessionPrivateKey);

        logger.info(`Session Key: ${this.sessionKey}`);

        // Connect to WebSocket
        return new Promise((resolve, reject) => {
            this.ws = new (WSConstructor as any)(YELLOW_CONFIG.WS_URL);

            const authParams: AuthParams = {
                session_key: this.sessionKey!,
                allowances: [...YELLOW_CONFIG.DEFAULT_ALLOWANCES],
                expires_at: BigInt(Math.floor(Date.now() / 1000) + (YELLOW_CONFIG.SESSION_EXPIRY_HOURS * 3600)),
                scope: YELLOW_CONFIG.APP_SCOPE,
            };

            const onOpen = async () => {
                logger.success('Connected to Yellow Network');

                const authRequestMsg = await createAuthRequestMessage({
                    address: account.address,
                    application: YELLOW_CONFIG.APP_NAME,
                    session_key: this.sessionKey! as `0x${string}`,
                    allowances: authParams.allowances,
                    expires_at: authParams.expires_at,
                    scope: authParams.scope,
                });

                this.ws!.send(authRequestMsg);
            };

            const onMessage = async (event: any) => {
                try {
                    // Handle both Node.js ws (Buffer) and browser WebSocket (MessageEvent)
                    let data: string;
                    if (typeof event === 'string') {
                        // Node.js ws sends string directly
                        data = event;
                    } else if (event.data) {
                        // Browser WebSocket has event.data
                        data = typeof event.data === 'string' ? event.data : event.data.toString();
                    } else if (Buffer.isBuffer(event)) {
                        // Node.js ws can send Buffer
                        data = event.toString();
                    } else {
                        data = event.toString();
                    }

                    const response: YellowResponse = JSON.parse(data);

                    logger.debug('Received message:', response);

                    if (response.error) {
                        logger.error(`RPC Error: ${response.error.message}`);
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
                            authParams as any,
                            { name: YELLOW_CONFIG.APP_NAME }
                        );

                        const verifyMsg = await createAuthVerifyMessageFromChallenge(
                            signer,
                            challenge
                        );

                        this.ws!.send(verifyMsg);
                        return;
                    }

                    // Handle auth success
                    if (response.res && response.res[1] === 'auth_verify') {
                        logger.success('Authenticated successfully!');
                        this.isAuthenticated = true;
                        resolve();
                        return;
                    }

                    // Handle other responses by message type
                    if (response.res && response.res[1]) {
                        const responseType = response.res[1];
                        if (this.messageHandlers.has(responseType)) {
                            const handler = this.messageHandlers.get(responseType)!;
                            handler(response);
                            this.messageHandlers.delete(responseType);
                        }
                    }

                } catch (error) {
                    logger.error(`Error handling message: ${error}`);
                    if (!this.isAuthenticated) {
                        reject(error);
                    }
                }
            };

            const onError = (err: any) => {
                logger.error(`WebSocket Error: ${err.message || err}`);
                reject(err);
            };

            const onClose = () => {
                logger.warn('WebSocket connection closed');
                this.isAuthenticated = false;
            };

            // Attach event listeners (works for both Node.js ws and browser WebSocket)
            if (typeof window !== 'undefined' && typeof window !== undefined) {
                // Browser WebSocket
                (this.ws as any).addEventListener('open', onOpen);
                (this.ws as any).addEventListener('message', onMessage);
                (this.ws as any).addEventListener('error', onError);
                (this.ws as any).addEventListener('close', onClose);
            } else {
                // Node.js ws
                (this.ws as any).on('open', onOpen);
                (this.ws as any).on('message', onMessage);
                (this.ws as any).on('error', onError);
                (this.ws as any).on('close', onClose);
            }
        });
    }

    /**
     * Send a message and wait for response
     * @param message - Message to send
     * @param expectedResponseType - Expected response type (e.g., 'get_ledger_balances')
     * @returns Promise with response
     */
    async sendMessage(message: string, expectedResponseType: string): Promise<YellowResponse> {
        if (!this.isAuthenticated || !this.ws) {
            throw new Error('Not authenticated. Call connect() first.');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.messageHandlers.delete(expectedResponseType);
                reject(new Error(`Timeout waiting for ${expectedResponseType} response`));
            }, YELLOW_CONFIG.REQUEST_TIMEOUT);

            this.messageHandlers.set(expectedResponseType, (response) => {
                clearTimeout(timeout);
                resolve(response);
            });

            this.ws!.send(message);
        });
    }

    /**
     * Disconnect from Yellow Network
     */
    disconnect(): void {
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
     * Check if connected and authenticated
     */
    isConnected(): boolean {
        return this.isAuthenticated && this.ws !== null;
    }

    /**
     * Get session signer (for creating signed messages)
     */
    getSessionSigner(): any {
        return this.sessionSigner;
    }
}
