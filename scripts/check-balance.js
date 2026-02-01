import { createECDSAMessageSigner, createEIP712AuthMessageSigner, createAuthVerifyMessageFromChallenge, createGetLedgerBalancesMessage, createAuthRequestMessage } from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import WebSocket from 'ws';
import 'dotenv/config';

async function runZeroHop() {
    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;
    const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    if (!PRIVATE_KEY) {
        console.error("❌ DEV_PRIVATE_KEY is missing in .env");
        process.exit(1);
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    console.log("🚀 Initializing Yellow ZeroHop Engine...");
    console.log(" Wallet Address:", account.address);

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(ALCHEMY_RPC_URL),
    });

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(),
        account,
    });

    // Generate a session key
    const { generatePrivateKey } = await import('viem/accounts');
    const sessionPrivateKey = generatePrivateKey();
    const sessionAccount = privateKeyToAccount(sessionPrivateKey);
    const sessionAddress = sessionAccount.address;
    const sessionSigner = createECDSAMessageSigner(sessionPrivateKey);

    console.log(" Session Key Generated:", sessionAddress);

    const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');

    const authParams = {
        session_key: sessionAddress,
        allowances: [{
            asset: 'ytest.usd',
            amount: '1000' // Minimal allowance
        }],
        expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600),
        scope: 'test.app',
    };

    const authRequestMsg = await createAuthRequestMessage({
        address: account.address,
        application: 'Test app',
        ...authParams
    });

    let isAuthenticated = false;

    ws.on('open', () => {
        console.log("🔌 Connected to WebSocket");
        ws.send(authRequestMsg);
    });

    ws.on('message', async (data) => {
        try {
            const response = JSON.parse(data.toString());

            if (response.error) {
                console.error("🚨 RPC Error:", response.error);
                process.exit(1);
            }

            if (response.res && response.res[1] === 'auth_challenge') {
                if (isAuthenticated) return;
                console.log("🔑 Received Auth Challenge, signing...");

                const challenge = response.res[2].challenge_message;

                // Sign with MAIN wallet
                const signer = createEIP712AuthMessageSigner(
                    walletClient,
                    authParams,
                    { name: 'Test app' }
                );

                const verifyMsg = await createAuthVerifyMessageFromChallenge(
                    signer,
                    challenge
                );

                ws.send(verifyMsg);
            }

            if (response.res && response.res[1] === 'auth_verify') {
                console.log("✅ Authenticated!");
                isAuthenticated = true;

                console.log("🔍 Fetching Ledger Balances...");
                const ledgerMsg = await createGetLedgerBalancesMessage(
                    sessionSigner,
                    account.address,
                    Date.now()
                );
                ws.send(ledgerMsg);
            }

            if (response.res && response.res[1] === 'get_ledger_balances') {
                const ledgerBalances = response.res[2].ledger_balances;
                console.log("\n--- LEDGER BALANCE ---");
                // Pretty print balances
                if (ledgerBalances && ledgerBalances.length > 0) {
                    for (const item of ledgerBalances) {
                        console.log(`${item.asset}: ${item.amount}`);
                    }
                } else {
                    console.log("No active balances found.");
                }
                console.log("----------------------\n");

                ws.close();
                process.exit(0);
            }

        } catch (error) {
            console.error("🚨 Error handling message:", error);
            ws.close();
            process.exit(1);
        }
    });

    ws.on('error', (err) => {
        console.error("🚨 WebSocket Error:", err);
        process.exit(1);
    });
}

runZeroHop();