/**
 * Centralized cookie utilities for user preferences
 * Works on both client and server side
 */

import { browser } from '$app/environment';

export interface UserPreferences {
    theme: 'light' | 'dark' | 'system';
    themeScheme: 'default' | 'spells';
    language: string;
    languageTheme: 'default' | 'spells';
    showSidebar: boolean;
}

export const PREFERENCE_COOKIE_NAMES = {
    theme: 'theme',
    themeScheme: 'themeScheme',
    language: 'language',
    languageTheme: 'languageTheme',
    showSidebar: 'showSidebar',
} as const;

export const COOKIE_OPTIONS = {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    httpOnly: false, // Allow client-side access
    secure: false, // Allow in development
    sameSite: 'lax' as const,
};

/**
 * Reads user preferences from browser cookies on the client side.
 *
 * Parses document.cookie and extracts theme-related preferences.
 * Only operates in browser environment; returns empty object on server.
 *
 * @returns Partial object containing available user preferences from cookies
 *
 * @example
 * ```typescript
 * import { readPreferenceCookies } from './utils/cookies';
 *
 * const prefs = readPreferenceCookies();
 * // prefs = { theme: 'dark', themeScheme: 'spells', showSidebar: true }
 * ```
 *
 * @remarks
 * - Returns empty object `{}` when not in browser environment
 * - Returns empty object if no cookies are set
 * - Cookie values are automatically type-cast to appropriate types
 */
export function readPreferenceCookies(): Partial<UserPreferences> {
    if (!browser) return {};

    const preferences: Partial<UserPreferences> = {};

    if (!document.cookie) return preferences;

    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        // Handle values containing '=' by only splitting on first '='
        const eqIndex = cookie.indexOf('=');
        if (eqIndex === -1) continue;

        const key = cookie.substring(0, eqIndex).trim();
        // Decode URL-encoded values and get everything after the first '='
        let value: string;
        try {
            value = decodeURIComponent(cookie.substring(eqIndex + 1));
        } catch {
            // If decoding fails, use the raw value
            value = cookie.substring(eqIndex + 1);
        }

        if (key === 'theme') preferences.theme = value as UserPreferences['theme'];
        if (key === 'themeScheme')
            preferences.themeScheme = value as UserPreferences['themeScheme'];
        if (key === 'language') preferences.language = value;
        if (key === 'languageTheme')
            preferences.languageTheme = value as UserPreferences['languageTheme'];
        if (key === 'showSidebar') preferences.showSidebar = ['true', '1', 'yes'].includes(value?.toLowerCase());
    }

    return preferences;
}

/**
 * Writes user preferences to browser cookies on the client side.
 *
 * Persists theme and other preferences to cookies with a 1-year expiration.
 * Only operates in browser environment; no-op on server.
 *
 * @param preferences - Partial preferences object with values to save
 *
 * @example
 * ```typescript
 * import { writePreferenceCookies } from './utils/cookies';
 *
 * // Save theme preferences
 * writePreferenceCookies({
 *   theme: 'dark',
 *   themeScheme: 'spells'
 * });
 *
 * // Update only specific preferences
 * writePreferenceCookies({ showSidebar: false });
 * ```
 *
 * @remarks
 * - Does nothing when not in browser environment
 * - Cookies set with: path=/, max-age=1 year, SameSite=lax
 * - Only writes cookies for properties that are defined in the preferences object
 */
export function writePreferenceCookies(preferences: Partial<UserPreferences>): void {
    if (!browser) return;

    const cookieOptions = `path=${COOKIE_OPTIONS.path}; max-age=${COOKIE_OPTIONS.maxAge}; SameSite=${COOKIE_OPTIONS.sameSite}`;

    if (preferences.theme) {
        document.cookie = `theme=${preferences.theme}; ${cookieOptions}`;
    }
    if (preferences.themeScheme) {
        document.cookie = `themeScheme=${preferences.themeScheme}; ${cookieOptions}`;
    }
    if (preferences.language) {
        document.cookie = `language=${preferences.language}; ${cookieOptions}`;
    }
    if (preferences.languageTheme) {
        document.cookie = `languageTheme=${preferences.languageTheme}; ${cookieOptions}`;
    }
    if (preferences.showSidebar !== undefined) {
        document.cookie = `showSidebar=${preferences.showSidebar}; ${cookieOptions}`;
    }
}

/**
 * Returns the default user preferences.
 *
 * Provides sensible fallback values for all preference options when
 * no saved preferences are available.
 *
 * @returns Complete UserPreferences object with default values
 *
 * @example
 * ```typescript
 * import { getDefaultPreferences } from './utils/cookies';
 *
 * const defaults = getDefaultPreferences();
 * // {
 * //   theme: 'system',
 * //   themeScheme: 'default',
 * //   language: 'en',
 * //   languageTheme: 'default',
 * //   showSidebar: true
 * // }
 * ```
 */
export function getDefaultPreferences(): UserPreferences {
    return {
        theme: 'system',
        themeScheme: 'default',
        language: 'en',
        languageTheme: 'default',
        showSidebar: true,
    };
}
