/**
 * Logging utility for consistent output formatting
 */

const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
} as const;

export const logger = {
    info: (message: string): void => {
        console.log(`${COLORS.blue}ℹ️  ${message}${COLORS.reset}`);
    },

    success: (message: string): void => {
        console.log(`${COLORS.green}✅ ${message}${COLORS.reset}`);
    },

    error: (message: string): void => {
        console.error(`${COLORS.red}❌ ${message}${COLORS.reset}`);
    },

    warn: (message: string): void => {
        console.warn(`${COLORS.yellow}⚠️  ${message}${COLORS.reset}`);
    },

    debug: (message: string, ...args: any[]): void => {
        if (process.env.DEBUG) {
            console.log(`${COLORS.dim}🔍 ${message}${COLORS.reset}`, ...args);
        }
    },

    section: (title: string): void => {
        console.log('\n');
        console.log('='.repeat(50));
        console.log(`  ${title}`);
        console.log('='.repeat(50));
        console.log('');
    },
};
