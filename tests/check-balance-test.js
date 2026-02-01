import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Point to the script in ../scripts/check-balance.js
const scriptPath = path.resolve(__dirname, '../scripts/check-balance.js');

console.log(`🧪 Testing script: ${scriptPath}`);

// Spawn the node process to run the script
const child = spawn('node', [scriptPath], {
    stdio: 'inherit', // Pipe logs directly to parent terminal
    env: { ...process.env } // Pass environment variables
});

child.on('close', (code) => {
    console.log(`\n✅ Script finished with code ${code}`);
    if (code === 0) {
        process.exit(0);
    } else {
        console.error("❌ Test Failed: Script exited with error");
        process.exit(1);
    }
});
