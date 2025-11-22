/**
 * Simple logging utility for the theme engine.
 *
 * Provides consistent log formatting with a '[svelte-themes]' prefix
 * for easy identification in console output. Debug and info logs are
 * suppressed in production builds to reduce console noise.
 *
 * @example
 * ```typescript
 * import { logger } from './utils/logger';
 *
 * logger.info('Theme initialized', { theme: 'dark' });
 * logger.warn('Invalid color format', color);
 * logger.error('Failed to save theme', error);
 * ```
 */

// Check if we're in development mode
// Falls back to true if import.meta is not available
const isDev = typeof import.meta !== 'undefined'
    ? (import.meta as { env?: { DEV?: boolean } }).env?.DEV !== false
    : true;

// No-op function for suppressed logs
const noop = () => {};

export const logger = {
    /**
     * Log informational messages.
     * Only logs in development mode.
     * @param args - Arguments to log (forwarded to console.log)
     */
    info: isDev ? (...args: any[]) => console.log('[svelte-themes]', ...args) : noop,

    /**
     * Log debug messages.
     * Only logs in development mode.
     * @param args - Arguments to log (forwarded to console.log)
     */
    debug: isDev ? (...args: any[]) => console.log('[svelte-themes]', ...args) : noop,

    /**
     * Log warning messages.
     * Always logs (warnings are important in production).
     * @param args - Arguments to log (forwarded to console.warn)
     */
    warn: (...args: any[]) => console.warn('[svelte-themes]', ...args),

    /**
     * Log error messages.
     * Always logs (errors are critical in production).
     * @param args - Arguments to log (forwarded to console.error)
     */
    error: (...args: any[]) => console.error('[svelte-themes]', ...args),
};
