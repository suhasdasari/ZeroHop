/**
 * Logging utilities for consistent output across scripts
 */

export const logger = {
    info: (message, ...args) => {
        console.log(`ℹ️  ${message}`, ...args);
    },

    success: (message, ...args) => {
        console.log(`✅ ${message}`, ...args);
    },

    error: (message, ...args) => {
        console.error(`❌ ${message}`, ...args);
    },

    warn: (message, ...args) => {
        console.warn(`⚠️  ${message}`, ...args);
    },

    debug: (message, ...args) => {
        if (process.env.DEBUG) {
            console.log(`🔍 ${message}`, ...args);
        }
    },

    section: (title) => {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`  ${title}`);
        console.log(`${'='.repeat(50)}\n`);
    },
};
