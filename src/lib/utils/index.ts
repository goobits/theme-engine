/**
 * Theme Utilities
 *
 * Helper functions for cookie management, logging, and route-based themes.
 * These utilities support both client and server-side theme handling.
 *
 * @module utils
 *
 * @example
 * ```typescript
 * import { readPreferenceCookies, getRouteTheme } from '@goobits/themes/utils';
 *
 * const prefs = readPreferenceCookies();
 * const routeConfig = getRouteTheme('/admin', routeThemes);
 * ```
 */

export * from './cookies';
export * from './logger';
export * from './route-themes';
