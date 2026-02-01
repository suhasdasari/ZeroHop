import { privateKeyToAccount } from 'viem/accounts';
import 'dotenv/config';

async function fundWallet() {
    console.log("🚰 Starting Yellow Network Faucet (Sandbox)...");

    const FAUCET_REQUEST_ADDRESS = process.env.FAUCET_REQUEST_ADDRESS;
    if (!FAUCET_REQUEST_ADDRESS) {
        console.error("❌ FAUCET_REQUEST_ADDRESS is missing in .env");
        console.log("   (This is the address that will receive the test tokens)");
        process.exit(1);
    }

    // We don't strictly need the Private Key for this HTTP request, 
    // but the test environment might expect it. for now we just use the address.
    const userAddress = FAUCET_REQUEST_ADDRESS;
    console.log(`👤 Requesting funds for: ${userAddress}`);

    // Endpoint from Yellow Network Docs
    const FAUCET_URL = 'https://clearnet-sandbox.yellow.com/faucet/requestTokens';

    try {
        console.log(`⏳ Requesting tokens from ${FAUCET_URL}...`);

        const response = await fetch(FAUCET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userAddress })
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
        }

        console.log("✅ Faucet Request Successful!");
        console.log(`📄 Response: ${text}`);

        console.log("\n💡 Note: These tokens are credited to your 'Unified Balance' (Off-Chain), not your on-chain wallet.");
        console.log("   Run 'npm run test:balance' to verify receipt.");
        process.exit(0);

    } catch (error) {
        console.error("🚨 Faucet Request Failed:", error.message);
        process.exit(1);
    }
}

fundWallet();
