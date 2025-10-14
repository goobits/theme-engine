/**
 * Route-Based Theme Configuration Utilities
 *
 * Provides functions for matching routes against a theme configuration.
 */

import type { FullTheme, ThemeScheme } from "../core/types";

export interface RouteThemeConfig {
  /** The full theme to apply for this route */
  theme: FullTheme;
  /** Whether this route theme overrides user preferences */
  override: boolean;
  /** Optional description for this route theme */
  description?: string;
}

/**
 * Gets the theme configuration for a specific route.
 * @param pathname The route's pathname.
 * @param routeThemes A record of route-specific theme configurations.
 * @returns The theme configuration for the route, or null if not found.
 */
export function getRouteTheme(pathname:string, routeThemes: Record<string, RouteThemeConfig>): RouteThemeConfig | null {
    // Direct match first
    if (routeThemes[pathname]) {
        return routeThemes[pathname];
    }

    // Check for wildcard matches
    for (const [routePattern, config] of Object.entries(routeThemes)) {
        if (routePattern.includes("*")) {
            const pattern = routePattern.replace(/\*/g, ".*");
            const regex = new RegExp(`^${pattern}$`);
            if (regex.test(pathname)) {
                return config;
            }
        }
    }

    return null;
}

/**
 * Checks if a route has a specific theme configuration.
 * @param pathname The route's pathname.
 * @param routeThemes A record of route-specific theme configurations.
 * @returns True if the route has a theme, false otherwise.
 */
export function routeHasTheme(pathname: string, routeThemes: Record<string, RouteThemeConfig>): boolean {
    return getRouteTheme(pathname, routeThemes) !== null;
}

/**
 * Gets all routes that use a specific theme scheme.
 * @param scheme The theme scheme to search for.
 * @param routeThemes A record of route-specific theme configurations.
 * @returns An array of routes that use the specified scheme.
 */
export function getRoutesForScheme(scheme: ThemeScheme, routeThemes: Record<string, RouteThemeConfig>): string[] {
    return Object.entries(routeThemes)
        .filter(([_, config]) => config.theme.scheme === scheme)
        .map(([route, _]) => route);
}

/**
 * Checks if a route's theme should override user preferences.
 * @param pathname The route's pathname.
 * @param routeThemes A record of route-specific theme configurations.
 * @returns True if the route theme overrides user preferences, false otherwise.
 */
export function routeThemeOverrides(pathname: string, routeThemes: Record<string, RouteThemeConfig>): boolean {
    const config = getRouteTheme(pathname, routeThemes);
    return config?.override ?? false;
}
