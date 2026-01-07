/**
 * Theme Engine Constants and Utilities
 *
 * Centralized configuration values and shared utility functions
 * used throughout the theme engine.
 */

import type { ThemeMode } from './schemeRegistry.js'

/**
 * Duration in milliseconds to disable CSS transitions during theme switching.
 * This prevents visual glitches when rapidly changing themes.
 */
export const THEME_TRANSITION_DURATION_MS = 100

/**
 * Duration in milliseconds to display ARIA announcements for screen readers.
 * After this time, the announcement is cleared to avoid cluttering the live region.
 */
export const ARIA_ANNOUNCEMENT_DURATION_MS = 3000

/**
 * Local storage key for persisting theme preferences.
 * Versioned to allow for schema migrations in the future.
 */
export const STORAGE_KEY = 'app_theme_v1'

/**
 * Cookie names used for storing user preferences.
 * Shared between client (cookies.ts) and server (preferences.ts).
 */
export const PREFERENCE_COOKIE_NAMES = {
	theme: 'theme',
	themeScheme: 'themeScheme',
	language: 'language',
	languageTheme: 'languageTheme',
	showSidebar: 'showSidebar'
} as const

/**
 * Resolves a theme mode to its visual representation.
 *
 * Converts the user's theme preference into an actual visual theme (light or dark).
 * When the theme is 'system', it queries the provided dark mode preference to determine
 * the resolved visual theme.
 *
 * @param theme - The user's theme preference ('light', 'dark', or 'system')
 * @param prefersDark - Whether the user's system/browser prefers dark mode (only used when theme is 'system')
 * @returns The resolved visual theme, always 'light' or 'dark' (never 'system')
 *
 * @example
 * ```typescript
 * // Direct theme selection
 * resolveTheme('light', false); // 'light'
 * resolveTheme('dark', true); // 'dark'
 *
 * // System preference resolution
 * resolveTheme('system', true); // 'dark' (user prefers dark mode)
 * resolveTheme('system', false); // 'light' (user prefers light mode)
 * ```
 *
 * @see {@link applyFullTheme} for applying themes with this resolution logic
 */
export function resolveTheme(theme: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
	if (theme === 'system') {
		return prefersDark ? 'dark' : 'light'
	}
	return theme
}
