/**
 * Route-Based Theme Configuration Utilities
 *
 * Provides functions for matching routes against a theme configuration.
 */

import type { FullTheme, ThemeScheme } from '../core/types';

export interface RouteThemeConfig {
    /** The full theme to apply for this route */
    theme: FullTheme;
    /** Whether this route theme overrides user preferences */
    override: boolean;
    /** Optional description for this route theme */
    description?: string;
}

/**
 * Get theme configuration for a route
 */
export function getRouteTheme(
    pathname: string,
    routeThemes: Record<string, RouteThemeConfig>
): RouteThemeConfig | null {
    // Direct match first
    if (routeThemes[pathname]) {
        return routeThemes[pathname];
    }

    // Check for wildcard matches
    for (const [routePattern, config] of Object.entries(routeThemes)) {
        if (routePattern.includes('*')) {
            const pattern = routePattern.replace(/\*/g, '.*');
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(pathname)) {
                return config;
            }
        }
    }

    return null;
}

/**
 * Check if a route has a specific theme
 */
export function routeHasTheme(
    pathname: string,
    routeThemes: Record<string, RouteThemeConfig>
): boolean {
    return getRouteTheme(pathname, routeThemes) !== null;
}

/**
 * Get all routes that use a specific scheme
 */
export function getRoutesForScheme(
    scheme: ThemeScheme,
    routeThemes: Record<string, RouteThemeConfig>
): string[] {
    return Object.entries(routeThemes)
        .filter(([_, config]) => config.theme.scheme === scheme)
        .map(([route, _]) => route);
}

/**
 * Check if route theme should override user preferences
 */
export function routeThemeOverrides(
    pathname: string,
    routeThemes: Record<string, RouteThemeConfig>
): boolean {
    const config = getRouteTheme(pathname, routeThemes);
    return config?.override ?? false;
}
