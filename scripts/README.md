# Yellow Network Scripts

Modular Yellow Network integration for ZeroHop exchange with persistent sessions.

## 📁 Structure

```
scripts/
├── core/
│   ├── YellowSessionManager.js    ← Session management (220 lines)
│   └── config.js                  ← Configuration
├── actions/
│   ├── getBalance.js              ← Fetch balances ✅
│   ├── fundWallet.js              ← Request faucet tokens ✅
│   └── placeOrder.js              ← Place orders (placeholder)
├── tests/
│   ├── test-session.js            ← ✅ PASSED
│   ├── test-balance.js            ← ✅ PASSED
│   ├── test-faucet.js             ← ✅ PASSED
│   └── test-full-flow.js          ← ✅ PASSED
└── utils/
    └── logger.js                  ← Logging utilities
```

## 🚀 Quick Start

### Test Session Creation
```bash
npm run test:session
```
**Result**: Creates session, authenticates, maintains connection for 5s, disconnects cleanly.

### Test Balance Fetching
```bash
npm run test:balance
```
**Result**: Connects, fetches ledger balances, displays assets, disconnects.

### Test Faucet Request
```bash
npm run test:faucet
```
**Result**: Requests 10 ytest.usd tokens from Yellow Network faucet.

### Test Full Trading Flow
```bash
npm run test:flow
```
**Result**: Demonstrates persistent session across multiple operations (balance → order → balance).

## 💡 How It Works

### 1. YellowSessionManager (Core)
Handles WebSocket connection and authentication:
- **Connects** to Yellow Network (`wss://clearnet-sandbox.yellow.com/ws`)
- **Generates** ephemeral session key (expires in 1 hour)
- **Authenticates** using EIP-712 challenge-response
- **Maintains** persistent WebSocket connection
- **Routes** responses by message type (`res[1]`)
- **Handles** timeouts (30s per request)

### 2. Actions (Modular)
Each action uses the active session:
- **`getBalance(session, address)`** - Fetch wallet balances
- **`fundWallet(address)`** - Request test tokens from faucet
- **`placeOrder(session, params)`** - Submit trading orders (placeholder)

### 3. Persistent Sessions
**Old Approach** (inefficient):
```
Connect → Auth → Get Balance → Disconnect
Connect → Auth → Place Order → Disconnect
```

**New Approach** (efficient):
```
Connect → Auth → [Balance, Orders, Trades, ...] → Disconnect
```

## 📝 Usage Example

```javascript
import { YellowSessionManager } from './core/YellowSessionManager.js';
import { getBalance } from './actions/getBalance.js';
import { placeOrder } from './actions/placeOrder.js';

const session = new YellowSessionManager();

// Connect once
await session.connect(privateKey);

// Perform multiple operations with same session
const balances = await getBalance(session, address);
const order = await placeOrder(session, {
    side: 'buy',
    symbol: 'BTC/USDT',
    amount: '0.001',
    price: '77000',
    type: 'limit'
});

// Disconnect when done
session.disconnect();
```

## 🔑 Key Features

### Security
- **Two-key system**: Main wallet signs auth, session key signs operations
- **Time-limited sessions**: 1 hour expiration
- **Allowance limits**: Configurable per-session spending limits

### Reliability
- **Timeout handling**: 30s timeout for all requests
- **Error handling**: Comprehensive error messages
- **Debug logging**: Enable with `DEBUG=1` environment variable

### Performance
- **Persistent connections**: Reuse WebSocket for multiple operations
- **Message routing**: Efficient response handling by type
- **Clean disconnects**: Proper cleanup on session end

## 🔧 Environment Variables

Required in `.env`:
- `DEV_PRIVATE_KEY` - Your wallet private key (0x...)
- `ALCHEMY_RPC_URL` - Alchemy RPC endpoint for Sepolia

Optional:
- `DEBUG=1` - Enable debug logging
- `FAUCET_REQUEST_ADDRESS` - Override address for faucet requests

## 📊 Test Results

All tests passing ✅:

| Test | Status | Details |
|------|--------|---------|
| Session | ✅ PASSED | Creates session, authenticates, maintains connection |
| Balance | ✅ PASSED | Fetches ledger balances (80 ytest.usd) |
| Faucet | ✅ PASSED | Requests tokens (+10 ytest.usd) |
| Full Flow | ✅ PASSED | Maintains session across operations |

## 🎯 Next Steps

1. **Implement Order Placement** - Add real order execution to `placeOrder.js`
2. **Create TypeScript Versions** - Convert for React app integration
3. **Build React Context** - Create `YellowProvider.tsx` using session manager
4. **Integrate with UI** - Connect to trading interface

## 🏗️ Architecture Benefits

- ✅ **Modular**: Separation of concerns (session vs. actions)
- ✅ **Reusable**: Actions work with any active session
- ✅ **Testable**: Each component tested independently
- ✅ **Scalable**: Easy to add new actions
- ✅ **Production-ready**: Error handling, timeouts, logging
