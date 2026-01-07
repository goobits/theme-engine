/**
 * Theme Utilities
 *
 * Helper functions for browser detection, cookie management, logging, and route-based themes.
 * These utilities support both client and server-side theme handling.
 *
 * @module utils
 *
 * @example
 * ```typescript
 * import { isBrowser, readPreferenceCookies, getRouteTheme } from '@goobits/themes/utils';
 *
 * if (isBrowser()) {
 *   const prefs = readPreferenceCookies();
 * }
 * const routeConfig = getRouteTheme('/admin', routeThemes);
 * ```
 */

export * from './browser.js'
export * from './cookies.js'
export * from './dom.js'
export * from './logger.js'
export * from './routeThemes.js'
export * from './systemTheme.js'
export * from './validation.js'
