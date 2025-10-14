/**
 * A simple logger for the theme package.
 */
export const logger = {
    /**
     * Logs informational messages.
     * @param {...any} args The messages to log.
     */
    info: (...args: any[]) => console.log('[svelte-themes]', ...args),
    /**
     * Logs debug messages.
     * @param {...any} args The messages to log.
     */
    debug: (...args: any[]) => console.log('[svelte-themes]', ...args),
    /**
     * Logs warning messages.
     * @param {...any} args The messages to log.
     */
    warn: (...args: any[]) => console.warn('[svelte-themes]', ...args),
    /**
     * Logs error messages.
     * @param {...any} args The messages to log.
     */
    error: (...args: any[]) => console.error('[svelte-themes]', ...args),
};
