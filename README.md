# ZeroHop

ZeroHop is a cutting-edge spot crypto exchange built on the Yellow Network.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

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

Open `.env` and add your keys (e.g., `DEV_PRIVATE_KEY` for scripts).

### 🖥️ 4. Run the Web Application

To start the Next.js frontend (The Exchange):

```bash
# Run from the root directory
npm run dev
```

The app will be available at `http://localhost:3000`.

### 🧪 5. Run Scripts

To test the Yellow Network integration script (Check Balance):

```bash
# Run from the root directory
npm run test:balance
```