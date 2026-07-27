/**
 * Server-side cookie utilities for theme preferences
 * Handles reading theme preferences for SSR support
 */

import type { Cookies } from '@sveltejs/kit'

import {
	getThemePersistenceConfig,
	resolveThemePreferences,
	type ThemeConfig
} from '../core/config.js'
import type { ThemeMode, ThemeScheme } from '../core/schemeRegistry.js'

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
	const persistence = getThemePersistenceConfig(config)
	return resolveThemePreferences(config, {
		theme: cookies.get(persistence.themeCookie),
		themeScheme: cookies.get(persistence.schemeCookie)
	})
}
