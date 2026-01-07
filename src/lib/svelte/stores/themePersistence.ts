/**
 * Theme Persistence Module
 *
 * Handles saving and loading theme preferences to/from localStorage and cookies.
 * Separated from state management for cleaner architecture and better testability.
 *
 * @module stores/themePersistence
 */

import { STORAGE_KEY } from '../../core/constants.js'
import type { ThemeMode, ThemeScheme } from '../../core/schemeRegistry.js'
import { isBrowser } from '../../utils/browser.js'
import {
	readPreferenceCookies,
	type UserPreferences,
	writePreferenceCookies
} from '../../utils/cookies.js'

/**
 * Theme preference data structure for persistence.
 *
 * Represents the raw theme preferences stored in localStorage/cookies.
 */
export interface ThemePersistenceData {

	/** Theme mode preference */
	theme: ThemeMode;

	/** Color scheme identifier */
	themeScheme: ThemeScheme;
}

/**
 * Save theme preferences to localStorage and cookies.
 *
 * Persists theme data to both storage mechanisms to enable SSR support
 * and cross-tab synchronization. Gracefully handles storage errors.
 *
 * @param data - Theme preferences to save
 *
 * @example
 * ```typescript
 * saveThemePreferences({ theme: 'dark', themeScheme: 'spells' });
 * ```
 *
 * @remarks
 * - Does nothing if not in browser environment
 * - Logs errors to console but doesn't throw
 * - Writes to both localStorage and cookies atomically
 */
export function saveThemePreferences(data: ThemePersistenceData): void {
	if (!isBrowser()) return

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
		writePreferenceCookies({
			theme: data.theme,
			themeScheme: data.themeScheme
		})
	} catch(err) {
		console.error('Failed to save theme settings to localStorage', err)
	}
}

/**
 * Load theme preferences from localStorage with cookie fallback.
 *
 * Attempts to restore preferences in this order:
 * 1. localStorage (primary source) - returns partial data if available
 * 2. Cookies (fallback for SSR scenarios) - requires both fields
 * 3. null (if nothing is found)
 *
 * @returns Theme preferences if found (may be partial), null otherwise
 *
 * @example
 * ```typescript
 * const saved = loadThemePreferences();
 * if (saved) {
 *   console.log('Theme:', saved.theme, 'Scheme:', saved.themeScheme);
 * }
 * ```
 *
 * @remarks
 * - Returns null if not in browser environment
 * - Returns null if no saved preferences exist
 * - Handles JSON parse errors gracefully
 * - localStorage can return partial data (missing fields will be undefined)
 * - Cookies require both theme and themeScheme to be present
 */
export function loadThemePreferences(): Partial<ThemePersistenceData> | null {
	if (!isBrowser()) {
		return null
	}

	// Try localStorage first
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			const parsed = JSON.parse(saved)

			// Return parsed data even if partial - caller will merge with defaults
			return parsed
		}
	} catch(err) {
		console.warn('Failed to load theme settings from localStorage', err)
	}

	// Fallback to cookies
	try {
		const cookieSettings: Partial<UserPreferences> = readPreferenceCookies()
		if (cookieSettings.theme && cookieSettings.themeScheme) {
			return {
				theme: cookieSettings.theme,
				themeScheme: cookieSettings.themeScheme
			}
		}
	} catch {
		// Cookie reading failed, return null
	}

	return null
}

/**
 * Clear saved theme preferences from localStorage.
 *
 * Removes the theme preferences from localStorage. Note that cookies
 * are not cleared as they have an expiration and will naturally expire.
 *
 * @example
 * ```typescript
 * clearThemePreferences();
 * ```
 *
 * @remarks
 * - Does nothing if not in browser environment
 * - Only clears localStorage, not cookies
 * - Handles errors gracefully
 */
export function clearThemePreferences(): void {
	if (!isBrowser()) return

	try {
		localStorage.removeItem(STORAGE_KEY)
	} catch(err) {
		console.error('Failed to clear theme settings from localStorage', err)
	}
}
