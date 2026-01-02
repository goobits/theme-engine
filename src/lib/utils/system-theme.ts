/**
 * System Theme Detection Utilities
 *
 * Centralized utilities for detecting and monitoring system theme preferences.
 * Consolidates the prefers-color-scheme media query logic that is duplicated
 * across the codebase into reusable functions with consistent browser environment
 * handling.
 *
 * @module system-theme
 */

import { browser } from '$app/environment';
import type { ThemeMode } from '../core/types';

/**
 * The media query string for detecting dark mode preference.
 *
 * This constant provides a single source of truth for the prefers-color-scheme
 * media query used throughout the theme system. Use this instead of hardcoding
 * the query string to ensure consistency.
 *
 * @example
 * ```typescript
 * import { DARK_MODE_MEDIA_QUERY } from './utils/system-theme';
 *
 * const mql = window.matchMedia(DARK_MODE_MEDIA_QUERY);
 * console.log(mql.matches); // true if dark mode is preferred
 * ```
 */
export const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)';

/**
 * Get the MediaQueryList object for dark mode preference detection.
 *
 * Returns a MediaQueryList that can be used to check the current dark mode
 * preference or to listen for changes. Returns null when not in a browser
 * environment (e.g., during SSR).
 *
 * @returns MediaQueryList for dark mode detection, or null if not in browser
 *
 * @example
 * ```typescript
 * import { getDarkModeMediaQuery } from './utils/system-theme';
 *
 * const mql = getDarkModeMediaQuery();
 * if (mql) {
 *   console.log('Prefers dark mode:', mql.matches);
 *   mql.addEventListener('change', (e) => {
 *     console.log('Theme preference changed:', e.matches);
 *   });
 * }
 * ```
 *
 * @remarks
 * - Returns null in non-browser environments (SSR, Node.js tests)
 * - The returned MediaQueryList is safe to use with addEventListener
 * - Use this when you need to set up event listeners for preference changes
 *
 * @see {@link prefersDarkMode} for a simpler boolean check
 * @see {@link watchSystemTheme} for monitoring theme changes with a callback
 */
export function getDarkModeMediaQuery(): MediaQueryList | null {
    if (!browser || typeof window === 'undefined') return null;
    return window.matchMedia(DARK_MODE_MEDIA_QUERY);
}

/**
 * Check if the user's system is set to prefer dark mode.
 *
 * Queries the operating system's color scheme preference and returns true
 * if dark mode is preferred. Returns false in non-browser environments or
 * if the preference cannot be determined (defaulting to light mode).
 *
 * @returns true if dark mode is preferred, false otherwise
 *
 * @example
 * ```typescript
 * import { prefersDarkMode } from './utils/system-theme';
 *
 * if (prefersDarkMode()) {
 *   console.log('User prefers dark mode');
 *   applyDarkTheme();
 * } else {
 *   console.log('User prefers light mode');
 *   applyLightTheme();
 * }
 * ```
 *
 * @remarks
 * - Safe to call in any environment; returns false on server
 * - This is a one-time check; use watchSystemTheme for reactive updates
 * - Defaults to false (light mode) when preference is unavailable
 *
 * @see {@link getSystemThemePreference} for getting 'light' or 'dark' string
 * @see {@link watchSystemTheme} for monitoring changes
 */
export function prefersDarkMode(): boolean {
    const mql = getDarkModeMediaQuery();
    return mql?.matches ?? false;
}

/**
 * Get the system's theme preference as a string value.
 *
 * Returns either 'light' or 'dark' based on the operating system's
 * color scheme preference. Defaults to 'light' in non-browser environments
 * or when the preference cannot be determined.
 *
 * @returns 'light' or 'dark' based on system preference
 *
 * @example
 * ```typescript
 * import { getSystemThemePreference } from './utils/system-theme';
 *
 * const systemTheme = getSystemThemePreference();
 * console.log(`System prefers: ${systemTheme}`); // 'light' or 'dark'
 *
 * // Use in theme initialization
 * const initialTheme = userPreference === 'system'
 *   ? getSystemThemePreference()
 *   : userPreference;
 * ```
 *
 * @remarks
 * - Returns 'light' as the safe default in non-browser environments
 * - This is a one-time check; use watchSystemTheme for reactive updates
 * - Useful for resolving 'system' theme mode to an actual theme value
 *
 * @see {@link prefersDarkMode} for a boolean check
 * @see {@link resolveThemeMode} for handling ThemeMode values including 'system'
 */
export function getSystemThemePreference(): 'light' | 'dark' {
    return prefersDarkMode() ? 'dark' : 'light';
}

/**
 * Resolve a ThemeMode value to an actual 'light' or 'dark' theme.
 *
 * Converts a ThemeMode (which can be 'light', 'dark', or 'system') into
 * a concrete theme value. When the mode is 'system', queries the operating
 * system preference to determine the appropriate theme.
 *
 * @param theme - The theme mode to resolve: 'light', 'dark', or 'system'
 * @returns The resolved theme: 'light' or 'dark'
 *
 * @example
 * ```typescript
 * import { resolveThemeMode } from './utils/system-theme';
 *
 * // Direct theme values pass through unchanged
 * resolveThemeMode('light');  // returns 'light'
 * resolveThemeMode('dark');   // returns 'dark'
 *
 * // System mode is resolved to actual preference
 * resolveThemeMode('system'); // returns 'dark' if OS prefers dark, else 'light'
 *
 * // Use in theme application
 * const userMode = getUserThemeMode(); // Could be 'system'
 * const actualTheme = resolveThemeMode(userMode);
 * applyTheme(actualTheme); // Always 'light' or 'dark'
 * ```
 *
 * @remarks
 * - Always returns a concrete 'light' or 'dark' value, never 'system'
 * - System preference defaults to 'light' in non-browser environments
 * - This is a one-time resolution; use watchSystemTheme to track changes
 *
 * @see {@link getSystemThemePreference} for getting system preference directly
 * @see {@link watchSystemTheme} for monitoring system preference changes
 */
export function resolveThemeMode(theme: ThemeMode): 'light' | 'dark' {
    if (theme === 'system') {
        return getSystemThemePreference();
    }
    return theme;
}

/**
 * Watch for changes to the system's theme preference.
 *
 * Sets up a listener that monitors the operating system's color scheme preference
 * and calls the provided callback whenever it changes (e.g., when the user switches
 * between light and dark mode in their OS settings). Returns a cleanup function
 * that should be called to remove the listener and prevent memory leaks.
 *
 * @param callback - Function called when system theme changes, receives true for dark mode
 * @returns Cleanup function that removes the event listener
 *
 * @example
 * ```typescript
 * import { watchSystemTheme } from './utils/system-theme';
 * import { onDestroy } from 'svelte';
 *
 * // Set up watcher
 * const cleanup = watchSystemTheme((isDark) => {
 *   console.log(`System theme changed to: ${isDark ? 'dark' : 'light'}`);
 *   if (currentThemeMode === 'system') {
 *     applyTheme(isDark ? 'dark' : 'light');
 *   }
 * });
 *
 * // Clean up when component unmounts
 * onDestroy(() => {
 *   cleanup();
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Watch and update a Svelte store
 * import { writable } from 'svelte/store';
 *
 * const systemTheme = writable(getSystemThemePreference());
 * const unwatch = watchSystemTheme((isDark) => {
 *   systemTheme.set(isDark ? 'dark' : 'light');
 * });
 * ```
 *
 * @remarks
 * - Returns a no-op function in non-browser environments (safe to call)
 * - Always call the cleanup function to prevent memory leaks
 * - Callback receives a boolean: true for dark mode, false for light mode
 * - Uses modern addEventListener API when available, falls back to legacy addListener
 * - The cleanup function is safe to call multiple times
 *
 * @see {@link getDarkModeMediaQuery} for direct MediaQueryList access
 * @see {@link prefersDarkMode} for one-time preference check
 */
export function watchSystemTheme(callback: (isDark: boolean) => void): () => void {
    const mql = getDarkModeMediaQuery();
    if (!mql) return () => {};

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        callback(e.matches);
    };

    // Modern API with addEventListener (standard)
    if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', handleChange);
        return () => {
            if (typeof mql.removeEventListener === 'function') {
                mql.removeEventListener('change', handleChange);
            }
        };
    }

    // Legacy API fallback for older browsers
    interface LegacyMediaQueryList {
        addListener?: (listener: (e: MediaQueryListEvent | MediaQueryList) => void) => void;
        removeListener?: (listener: (e: MediaQueryListEvent | MediaQueryList) => void) => void;
    }

    const legacyMQL = mql as MediaQueryList & LegacyMediaQueryList;
    if (typeof legacyMQL.addListener === 'function') {
        legacyMQL.addListener(handleChange);
        return () => {
            if (typeof legacyMQL.removeListener === 'function') {
                legacyMQL.removeListener(handleChange);
            }
        };
    }

    // No event support available
    return () => {};
}
