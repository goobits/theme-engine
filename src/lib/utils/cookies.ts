/**
 * Centralized cookie utilities for user preferences
 * Works on both client and server side
 */

import { PREFERENCE_COOKIE_NAMES } from '../core/constants'
import { isBrowser } from './browser'

export { PREFERENCE_COOKIE_NAMES }

export interface UserPreferences {
	theme: 'light' | 'dark' | 'system';
	themeScheme: 'default' | 'spells';
	language: string;
	languageTheme: 'default' | 'spells';
	showSidebar: boolean;
}

export const COOKIE_OPTIONS = {
	path: '/',
	maxAge: 60 * 60 * 24 * 365, // 1 year
	httpOnly: false, // Allow client-side access
	secure: false, // Allow in development
	sameSite: 'lax' as const
}

/** Type-safe parser functions for each preference type */
const PREFERENCE_PARSERS: { [K in keyof UserPreferences]: (value: string) => UserPreferences[K] } =
	{
		theme: v => v as UserPreferences['theme'],
		themeScheme: v => v as UserPreferences['themeScheme'],
		language: v => v,
		languageTheme: v => v as UserPreferences['languageTheme'],
		showSidebar: v => [ 'true', '1', 'yes' ].includes(v?.toLowerCase())
	}

/** Gets a cookie value by name. Returns last occurrence if duplicates exist. */
function getCookie(name: string): string | undefined {
	if (!document.cookie) return undefined
	let lastValue: string | undefined = undefined
	const cookies = document.cookie.split('; ')
	for (const cookie of cookies) {
		const eqIndex = cookie.indexOf('=')
		if (eqIndex === -1) continue
		const key = cookie.substring(0, eqIndex).trim()
		if (key !== name) continue
		try {
			lastValue = decodeURIComponent(cookie.substring(eqIndex + 1))
		} catch {
			lastValue = cookie.substring(eqIndex + 1)
		}
	}
	return lastValue
}

/** Sets a single cookie with the specified options */
function setCookie(name: string, value: string | boolean, options: typeof COOKIE_OPTIONS): void {
	document.cookie = `${ name }=${ value }; path=${ options.path }; max-age=${ options.maxAge }; SameSite=${ options.sameSite }`
}

/**
 * Reads user preferences from browser cookies.
 * Returns empty object on server or when no cookies are set.
 *
 * @example
 * const prefs = readPreferenceCookies();
 * // { theme: 'dark', themeScheme: 'spells', showSidebar: true }
 */
export function readPreferenceCookies(): Partial<UserPreferences> {
	if (!isBrowser()) return {}
	const preferences: Partial<UserPreferences> = {}
	for (const [ key, parser ] of Object.entries(PREFERENCE_PARSERS)) {
		const value = getCookie(key)
		if (value !== undefined) {
			preferences[key as keyof UserPreferences] = parser(value)
		}
	}
	return preferences
}

/**
 * Writes user preferences to browser cookies with a 1-year expiration.
 * No-op on server. Cookies set with: path=/, max-age=1 year, SameSite=lax.
 *
 * @example
 * writePreferenceCookies({ theme: 'dark', themeScheme: 'spells' });
 * writePreferenceCookies({ showSidebar: false });
 */
export function writePreferenceCookies(preferences: Partial<UserPreferences>): void {
	if (!isBrowser()) return
	for (const [ key, value ] of Object.entries(preferences)) {
		if (key === 'showSidebar') {
			if (value !== undefined) setCookie(key, value as boolean, COOKIE_OPTIONS)
		} else {
			if (value) setCookie(key, value as string, COOKIE_OPTIONS)
		}
	}
}

/**
 * Returns the default user preferences.
 *
 * @example
 * const defaults = getDefaultPreferences();
 * // { theme: 'system', themeScheme: 'default', language: 'en', ... }
 */
export function getDefaultPreferences(): UserPreferences {
	return {
		theme: 'system',
		themeScheme: 'default',
		language: 'en',
		languageTheme: 'default',
		showSidebar: true
	}
}
