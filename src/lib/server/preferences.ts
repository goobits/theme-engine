/**
 * Server-side cookie utilities for theme preferences
 * Handles reading theme preferences for SSR support
 */

import type { Cookies } from '@sveltejs/kit';
import type { ThemeMode, ThemeScheme } from '../core/types';
import type { ThemeConfig } from '../core/config';

/**
 * Loads theme preferences from cookies on the server side.
 *
 * Reads user's saved theme preferences from SvelteKit cookies to enable
 * server-side rendering with the correct theme applied. Falls back to
 * sensible defaults if cookies are not set.
 *
 * @param cookies - SvelteKit Cookies object from the server request
 * @param config - Theme configuration containing available schemes
 * @returns Object containing the user's theme mode and scheme preferences
 *
 * @example
 * ```typescript
 * // In hooks.server.ts
 * import { loadThemePreferences } from '$lib/server/preferences';
 * import { themeConfig } from '$lib/config';
 *
 * export const handle = async ({ event, resolve }) => {
 *   const preferences = loadThemePreferences(event.cookies, themeConfig);
 *   // preferences = { theme: 'dark', themeScheme: 'spells' }
 * };
 * ```
 *
 * @remarks
 * - Returns 'system' theme mode if no cookie is set
 * - Returns first scheme from config if no themeScheme cookie is set
 * - Cookie names: 'theme' and 'themeScheme'
 */
export function loadThemePreferences(
    cookies: Cookies,
    config: ThemeConfig
): { theme: ThemeMode; themeScheme: ThemeScheme } {
    const defaults = {
        theme: 'system',
        themeScheme: Object.keys(config.schemes)[0] || 'default',
    };

    return {
        theme: (cookies.get('theme') as ThemeMode) || defaults.theme,
        themeScheme: (cookies.get('themeScheme') as ThemeScheme) || defaults.themeScheme,
    };
}
