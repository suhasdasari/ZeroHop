# ZeroHop

ZeroHop is a cutting-edge spot crypto exchange built on the Yellow Network.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- A Sepolia testnet wallet with private key
- Alchemy RPC URL (or any Sepolia RPC provider)

### 📥 1. Clone the Repository

```bash
git clone https://github.com/suhasdasari/ZeroHop.git
cd ZeroHop
```

### 📦 2. Install Dependencies

We use a monorepo structure. Run this from the root directory to install dependencies for all apps and packages:

```bash
npm install
```

### 🔑 3. Environment Setup

Copy the example environment file and fill in your details:

```bash
cp .env.example .env
```

Open `.env` and add your configuration:

```bash
# Your Sepolia wallet private key (with 0x prefix)
DEV_PRIVATE_KEY=0x...

# Alchemy Sepolia RPC URL
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Address to receive faucet funds (usually your wallet address)
FAUCET_REQUEST_ADDRESS=0x...
```

### 🖥️ 4. Run the Web Application

To start the Next.js frontend (The Exchange):

```bash
# Run from the root directory
npm run dev
```

The app will be available at `http://localhost:3000`.

### 🧪 5. Testing Scripts

#### Check Balance (Yellow Network)

Test the Yellow Network integration and check your off-chain balance:

```bash
npm run test:balance
```

#### Request Faucet Funds

Request test tokens (`ytest.usd`) from the Yellow Network Sandbox faucet:

```bash
npm run test:faucet
```

**Note:** Faucet funds are credited to your **Unified Balance** (off-chain), not your on-chain wallet.

### 🏗️ 6. Build for Production

To create an optimized production build:

```bash
npm run build
```

## 📁 Project Structure

```
ZeroHop/
├── apps/
│   └── web/          # Next.js frontend application
├── packages/
│   └── config/       # Shared configurations (TypeScript, Tailwind, ESLint)
├── scripts/
│   ├── check-balance.js   # Check Yellow Network balance
│   └── fund-wallet.js     # Request faucet funds
├── tests/
│   ├── check-balance-test.js
│   └── fund-wallet-test.js
└── docs/             # Documentation
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the application for production |
| `npm run test:balance` | Check your Yellow Network balance |
| `npm run test:faucet` | Request test tokens from the faucet |

## 📚 Learn More

- [Yellow Network Documentation](https://docs.yellow.org)
- [Next.js Documentation](https://nextjs.org/docs)
- [Viem Documentation](https://viem.sh)