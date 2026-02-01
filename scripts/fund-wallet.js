import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import 'dotenv/config';

async function fundWallet() {
    console.log("🚰 Starting Faucet Script...");

    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;
    const FAUCET_ADDRESS = process.env.FAUCET_REQUEST_ADDRESS;
    const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;

    if (!PRIVATE_KEY) {
        console.error("❌ DEV_PRIVATE_KEY is missing in .env");
        process.exit(1);
    }

    if (!FAUCET_ADDRESS) {
        console.error("❌ FAUCET_REQUEST_ADDRESS is missing in .env");
        process.exit(1);
    }

    const account = privateKeyToAccount(PRIVATE_KEY);
    console.log(`👤 Identifying User: ${account.address}`);
    console.log(`🏦 Faucet Contract: ${FAUCET_ADDRESS}`);

    const client = createWalletClient({
        account,
        chain: sepolia,
        transport: http(ALCHEMY_RPC_URL)
    });

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(ALCHEMY_RPC_URL)
    });

    try {
        const abi = parseAbi([
            'function mint() external',
            'function claim() external'
        ]);

        console.log("⏳ Attempting to claim funds...");

        try {
            const hash = await client.writeContract({
                address: FAUCET_ADDRESS,
                abi,
                functionName: 'mint',
            });
            console.log(`✅ Transaction Sent! Hash: ${hash}`);
            await publicClient.waitForTransactionReceipt({ hash });
            console.log("🎉 Funds Received (Minted)!");
            process.exit(0);
        } catch (e) {
            console.log("⚠️ 'mint()' failed, trying 'claim()'...");
        }

        const hash = await client.writeContract({
            address: FAUCET_ADDRESS,
            abi,
            functionName: 'claim',
        });

        console.log(`✅ Transaction Sent! Hash: ${hash}`);
        await publicClient.waitForTransactionReceipt({ hash });
        console.log("🎉 Funds Received (Claimed)!");

    } catch (error) {
        console.error("🚨 Faucet Error:", error.message || error);
        process.exit(1);
    }
}

fundWallet();
