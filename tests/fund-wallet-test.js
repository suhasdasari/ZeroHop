import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, '../scripts/fund-wallet.js');

console.log(`🧪 Testing Faucet Script: ${scriptPath}`);

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
