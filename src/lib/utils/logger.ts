/**
 * Simple logging utility for the theme engine.
 *
 * Provides consistent log formatting with a '[svelte-themes]' prefix
 * for easy identification in console output. Debug and info logs are
 * suppressed in production builds to reduce console noise.
 *
 * Set `globalThis.__GOOBITS_THEMES_DEBUG__ = true` to enable debug logs in dev.
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

import { DEV } from 'esm-env'

// No-op function for suppressed logs
const noop = () => {}

const debugEnabled = DEV && (
	typeof globalThis !== 'undefined' &&
	(globalThis as { __GOOBITS_THEMES_DEBUG__?: boolean }).__GOOBITS_THEMES_DEBUG__ === true
)

export const logger = {
	/**
     * Log informational messages.
     * Only logs in development mode.
     * @param args - Arguments to log (forwarded to console.log)
     */
	info: debugEnabled ? (...args: unknown[]) => console.log('[svelte-themes]', ...args) : noop,

	/**
     * Log debug messages.
     * Only logs in development mode.
     * @param args - Arguments to log (forwarded to console.log)
     */
	debug: debugEnabled ? (...args: unknown[]) => console.log('[svelte-themes]', ...args) : noop,

	/**
     * Log warning messages.
     * Always logs (warnings are important in production).
     * @param args - Arguments to log (forwarded to console.warn)
     */
	warn: (...args: unknown[]) => console.warn('[svelte-themes]', ...args),

	/**
     * Log error messages.
     * Always logs (errors are critical in production).
     * @param args - Arguments to log (forwarded to console.error)
     */
	error: (...args: unknown[]) => console.error('[svelte-themes]', ...args)
}
