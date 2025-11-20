/**
 * Simple logging utility for the theme engine.
 *
 * Provides consistent log formatting with a '[svelte-themes]' prefix
 * for easy identification in console output. All methods forward to
 * native console methods.
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
export const logger = {
    /**
     * Log informational messages.
     * @param args - Arguments to log (forwarded to console.log)
     */
    info: (...args: any[]) => console.log('[svelte-themes]', ...args),

    /**
     * Log debug messages.
     * @param args - Arguments to log (forwarded to console.log)
     */
    debug: (...args: any[]) => console.log('[svelte-themes]', ...args),

    /**
     * Log warning messages.
     * @param args - Arguments to log (forwarded to console.warn)
     */
    warn: (...args: any[]) => console.warn('[svelte-themes]', ...args),

    /**
     * Log error messages.
     * @param args - Arguments to log (forwarded to console.error)
     */
    error: (...args: any[]) => console.error('[svelte-themes]', ...args),
};
