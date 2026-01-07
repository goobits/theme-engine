/**
 * Server-side cookie utilities for theme preferences
 * Handles reading theme preferences for SSR support
 */

import type { Cookies } from '@sveltejs/kit'

import type { ThemeConfig } from '../core/config.js'
import { PREFERENCE_COOKIE_NAMES } from '../core/constants.js'
import type { ThemeMode, ThemeScheme } from '../core/schemeRegistry.js'

/** Valid theme mode values for validation */
const VALID_THEME_MODES: ThemeMode[] = [ 'light', 'dark', 'system' ]

/**
 * Validates and sanitizes a theme mode value.
 * Returns the value if valid, otherwise returns the default.
 */
function validateThemeMode(value: string | undefined, defaultValue: ThemeMode): ThemeMode {
	if (value && VALID_THEME_MODES.includes(value as ThemeMode)) {
		return value as ThemeMode
	}
	return defaultValue
}

/**
 * Validates and sanitizes a theme scheme value.
 * Only allows alphanumeric characters, hyphens, and underscores.
 * Returns the value if valid, otherwise returns the default.
 */
function validateThemeScheme(
	value: string | undefined,
	validSchemes: string[],
	defaultValue: ThemeScheme
): ThemeScheme {
	if (!value) return defaultValue

	// Only allow safe characters: alphanumeric, hyphen, underscore
	const safePattern = /^[a-zA-Z0-9_-]+$/
	if (!safePattern.test(value)) {
		return defaultValue
	}

	// Check if it's a known scheme
	if (validSchemes.includes(value)) {
		return value
	}

	return defaultValue
}

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
	const validSchemes = Object.keys(config.schemes)
	const defaultScheme = validSchemes[0] || 'default'

	const defaults = {
		theme: 'system' as ThemeMode,
		themeScheme: defaultScheme
	}

	return {
		theme: validateThemeMode(
			cookies.get(PREFERENCE_COOKIE_NAMES.theme),
			defaults.theme
		),
		themeScheme: validateThemeScheme(
			cookies.get(PREFERENCE_COOKIE_NAMES.themeScheme),
			validSchemes,
			defaults.themeScheme
		)
	}
}
