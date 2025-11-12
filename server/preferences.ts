/**
 * Server-side cookie utilities for theme preferences
 * Handles reading theme preferences for SSR support
 */

import type { Cookies } from '@sveltejs/kit';
import type { ThemeMode, ThemeScheme } from '../core/types';
import type { ThemeConfig } from '../core/config';

/**
 * Read theme preferences from cookies (server-side)
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
