import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import 'dotenv/config';

async function fundWallet() {
    console.log("🚰 Starting Faucet Script...");

    const PRIVATE_KEY = process.env.DEV_PRIVATE_KEY;
    const FAUCET_ADDRESS = process.env.FAUCET_CONTRACT_ADDRESS;
    const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';

    if (!PRIVATE_KEY) {
        console.error("❌ DEV_PRIVATE_KEY is missing in .env");
        process.exit(1);
    }

    if (!FAUCET_ADDRESS) {
        console.error("❌ FAUCET_CONTRACT_ADDRESS is missing in .env");
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
        // ABI for a standard 'mint' or 'faucet' function. 
        // Adjust this ABI based on the actual Faucet Contract's method signature.
        // Common names: 'mint', 'claim', 'drip', 'requestTokens'
        const abi = parseAbi([
            'function mint() external',
            'function claim() external'
        ]);

        console.log("⏳ Attempting to claim funds...");

        // Try calling 'mint' first
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

        // Try calling 'claim' if mint failed
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
        console.log("💡 Tip: Check if the Faucet Contract uses a different function name (e.g., 'drip', 'request').");
        process.exit(1);
    }
}

fundWallet();
