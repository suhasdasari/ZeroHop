import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../scripts/fund-wallet.js');

console.log(`🧪 Testing Faucet Script: ${scriptPath}`);

// Check if Faucet Address is provided, otherwise warn
if (!process.env.FAUCET_CONTRACT_ADDRESS) {
    console.warn("⚠️  WARNING: FAUCET_CONTRACT_ADDRESS not found in .env. Test may fail or exit early.");
}

const child = spawn('node', [scriptPath], {
    stdio: 'inherit',
    env: { ...process.env }
});

child.on('close', (code) => {
    console.log(`\n✅ Faucet script finished with code ${code}`);
    if (code === 0) {
        process.exit(0);
    } else {
        console.error("❌ Test Failed: Script exited with error");
        process.exit(1);
    }
});
