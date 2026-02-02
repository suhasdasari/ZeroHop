# Yellow Network Scripts

Modular Yellow Network integration for ZeroHop exchange.

## 📁 Structure

```
scripts/
├── core/
│   ├── YellowSessionManager.js    ← Session management
│   └── config.js                  ← Configuration
├── actions/
│   ├── getBalance.js              ← Fetch balances
│   └── placeOrder.js              ← Place orders
├── tests/
│   ├── test-session.js            ← Test session creation
│   ├── test-balance.js            ← Test balance fetch
│   └── test-full-flow.js          ← Test complete flow
└── utils/
    └── logger.js                  ← Logging utilities
```

## 🚀 Usage

### Test Session Creation
```bash
npm run test:session
```

### Test Balance Fetching
```bash
npm run test:balance
```

### Test Full Trading Flow
```bash
npm run test:flow
```

## 💡 How It Works

### 1. Session Manager (Core)
Handles WebSocket connection and authentication:
- Connects to Yellow Network
- Generates session key
- Authenticates with challenge-response
- Maintains persistent connection

### 2. Actions (Modular)
Each action uses the session manager:
- `getBalance()` - Fetch wallet balances
- `placeOrder()` - Submit trading orders
- More actions can be added easily

### 3. Persistent Sessions
Unlike the old `check-balance.js`, sessions stay open:
- Connect once
- Perform multiple actions
- Disconnect when done

## 📝 Example

```javascript
import { YellowSessionManager } from './core/YellowSessionManager.js';
import { getBalance } from './actions/getBalance.js';

const session = new YellowSessionManager();

// Connect once
await session.connect(privateKey);

// Use session for multiple operations
const balances = await getBalance(session, address);
// ... more actions ...

// Disconnect when done
session.disconnect();
```

## 🔧 Environment Variables

Required in `.env`:
- `DEV_PRIVATE_KEY` - Your wallet private key
- `ALCHEMY_RPC_URL` - Alchemy RPC endpoint
