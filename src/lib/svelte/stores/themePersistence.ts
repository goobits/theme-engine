/**
 * Theme Persistence Module
 *
 * Handles saving and loading theme preferences to/from localStorage and cookies.
 * Separated from state management for cleaner architecture and better testability.
 *
 * @module stores/themePersistence
 */

import {
	DEFAULT_THEME_CONFIG,
	getThemePersistenceConfig,
	resolveThemePreferences,
	type ThemeConfig
} from '../../core/config.js'
import type { ThemeMode, ThemeScheme } from '../../core/schemeRegistry.js'
import { isBrowser } from '../../utils/browser.js'
import {
	clearPreferenceCookies,
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
 * Persists theme data to both storage mechanisms for client and SSR
 * consistency. Each mechanism fails independently.
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
 * - Attempts both localStorage and cookies if either mechanism fails
 */
export function saveThemePreferences(
	data: ThemePersistenceData,
	config: ThemeConfig = DEFAULT_THEME_CONFIG
): void {
	if (!isBrowser()) return
	const persistence = getThemePersistenceConfig(config)

	try {
		localStorage.setItem(persistence.storageKey, JSON.stringify(data))
	} catch(err) {
		console.error('Failed to save theme settings to localStorage', err)
	}

	try {
		writePreferenceCookies({
			theme: data.theme,
			themeScheme: data.themeScheme as UserPreferences['themeScheme']
		}, {
			theme: persistence.themeCookie,
			themeScheme: persistence.schemeCookie
		})
	} catch(err) {
		console.error('Failed to save theme settings to cookies', err)
	}
}

/**
 * Load theme preferences from localStorage with cookie fallback.
 *
 * Attempts to restore preferences in this order:
 * 1. Canonical localStorage JSON
 * 2. Configured cookies
 * 3. Optional legacy scheme-only localStorage value
 * 4. null
 *
 * @returns Complete normalized theme preferences, or null when none exist
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
 * - Partial or invalid data is normalized against configured defaults
 */
export function loadThemePreferences(
	config: ThemeConfig = DEFAULT_THEME_CONFIG
): ThemePersistenceData | null {
	if (!isBrowser()) {
		return null
	}
	const persistence = getThemePersistenceConfig(config)

	// Try localStorage first
	try {
		const saved = localStorage.getItem(persistence.storageKey)
		if (saved) {
			return resolveThemePreferences(config, JSON.parse(saved))
		}
	} catch(err) {
		console.warn('Failed to load theme settings from localStorage', err)
	}

	// Fallback to cookies
	try {
		const cookieSettings: Partial<UserPreferences> = readPreferenceCookies({
			theme: persistence.themeCookie,
			themeScheme: persistence.schemeCookie
		})
		if (cookieSettings.theme || cookieSettings.themeScheme) {
			return resolveThemePreferences(config, cookieSettings)
		}
	} catch {
		// Continue to an optional legacy storage migration.
	}

	if (persistence.legacySchemeStorageKey) {
		try {
			const legacyScheme = localStorage.getItem(persistence.legacySchemeStorageKey)
			if (legacyScheme) {
				const migrated = resolveThemePreferences(config, {
					themeScheme: legacyScheme
				})
				saveThemePreferences(migrated, config)
				localStorage.removeItem(persistence.legacySchemeStorageKey)
				return migrated
			}
		} catch(err) {
			console.warn('Failed to migrate legacy theme settings', err)
		}
	}

	return null
}

/**
 * Clear canonical, legacy, and cookie theme preferences.
 *
 * @example
 * ```typescript
 * clearThemePreferences();
 * ```
 *
 * @remarks
 * - Does nothing if not in browser environment
 * - Handles errors gracefully
 */
export function clearThemePreferences(
	config: ThemeConfig = DEFAULT_THEME_CONFIG
): void {
	if (!isBrowser()) return
	const persistence = getThemePersistenceConfig(config)

	try {
		localStorage.removeItem(persistence.storageKey)
		if (persistence.legacySchemeStorageKey) {
			localStorage.removeItem(persistence.legacySchemeStorageKey)
		}
	} catch(err) {
		console.error('Failed to clear theme settings from localStorage', err)
	}

	try {
		clearPreferenceCookies([ 'theme', 'themeScheme' ], {
			theme: persistence.themeCookie,
			themeScheme: persistence.schemeCookie
		})
	} catch(err) {
		console.error('Failed to clear theme settings from cookies', err)
	}
}
