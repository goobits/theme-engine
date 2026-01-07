/**
 * Route-Based Theme Configuration Utilities
 *
 * Provides functions for matching routes against a theme configuration.
 */

import type { FullTheme, ThemeScheme } from '../core/schemeRegistry'

export interface RouteThemeConfig {

	/** The full theme to apply for this route */
	theme: FullTheme;

	/** Whether this route theme overrides user preferences */
	override: boolean;

	/** Optional description for this route theme */
	description?: string;
}

/**
 * Escapes special regex characters in a string to prevent regex injection.
 * @internal
 */
function escapeRegex(str: string): string {
	return str.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Converts a wildcard pattern (e.g., '/admin/*') to a RegExp for route matching.
 * @internal
 */
function patternToRegex(pattern: string): RegExp {
	const escaped = escapeRegex(pattern)
	const regexPattern = escaped.replace(/\*/g, '.*')
	return new RegExp(`^${ regexPattern }$`)
}

/**
 * Get the theme configuration for a specific route.
 *
 * This function searches the route themes configuration to find a match for the given pathname.
 * It first checks for an exact route match, then falls back to wildcard pattern matching.
 * Wildcard patterns allow you to define theme rules for route hierarchies (e.g., '/admin/*'
 * to match all admin routes).
 *
 * @param pathname - The URL path to look up (e.g., '/admin/users', '/settings')
 * @param routeThemes - Object mapping route patterns to theme configurations.
 *                      Can include wildcards like '/admin/*' or '/blog/*'
 * @returns The RouteThemeConfig for the matched route, or null if no match is found.
 *          The config includes the theme, override flag, and optional description
 *
 * @example
 * ```typescript
 * const routeThemes: Record<string, RouteThemeConfig> = {
 *   '/admin': {
 *     theme: { base: 'dark', scheme: 'default' },
 *     override: true
 *   },
 *   '/blog/*': {
 *     theme: { base: 'light', scheme: 'default' },
 *     override: false
 *   }
 * };
 *
 * // Exact match
 * const adminTheme = getRouteTheme('/admin', routeThemes);
 * // Returns: { theme: { base: 'dark', scheme: 'default' }, override: true }
 *
 * // Wildcard match
 * const blogTheme = getRouteTheme('/blog/my-post', routeThemes);
 * // Returns: { theme: { base: 'light', scheme: 'default' }, override: false }
 *
 * // No match
 * const homeTheme = getRouteTheme('/home', routeThemes);
 * // Returns: null
 * ```
 *
 * @remarks
 * - Exact matches are prioritized before wildcard patterns
 * - Wildcard patterns use simple glob-to-regex conversion (replace * with .*)
 * - Returns null if no matching route theme is found
 * - The matching process stops at the first match found
 *
 * @see {@link routeHasTheme} for checking if a route has any theme without getting the config
 * @see {@link applyRouteTheme} for applying the theme from a route configuration
 */
export function getRouteTheme(
	pathname: string,
	routeThemes: Record<string, RouteThemeConfig>
): RouteThemeConfig | null {
	// Direct match first
	if (routeThemes[pathname]) {
		return routeThemes[pathname]
	}

	// Check for wildcard matches
	for (const [ routePattern, config ] of Object.entries(routeThemes)) {
		if (routePattern.includes('*') && patternToRegex(routePattern).test(pathname)) {
			return config
		}
	}

	return null
}

/**
 * Check if a route has a configured theme.
 *
 * A convenience function that returns a boolean indicating whether a specific route
 * has any theme configuration defined. Useful for conditional rendering or validation
 * without needing to inspect the full theme config object.
 *
 * @param pathname - The URL path to check (e.g., '/admin', '/settings')
 * @param routeThemes - Object mapping route patterns to theme configurations
 * @returns true if the route has a theme configuration (exact or wildcard match), false otherwise
 *
 * @example
 * ```typescript
 * const routeThemes: Record<string, RouteThemeConfig> = {
 *   '/admin': { theme: { base: 'dark', scheme: 'default' }, override: true },
 *   '/protected/*': { theme: { base: 'light', scheme: 'default' }, override: false }
 * };
 *
 * if (routeHasTheme('/admin', routeThemes)) {
 *   console.log('Admin route has a theme configured');
 * }
 *
 * routeHasTheme('/public', routeThemes); // false
 * routeHasTheme('/protected/settings', routeThemes); // true
 * ```
 *
 * @remarks
 * - Returns true if any route theme matches (exact or wildcard)
 * - Returns false if no route theme is found for the given pathname
 * - Internally uses {@link getRouteTheme}, so it uses the same matching algorithm
 *
 * @see {@link getRouteTheme} for retrieving the full theme configuration
 * @see {@link routeThemeOverrides} for checking if a route forces theme override
 */
export function routeHasTheme(
	pathname: string,
	routeThemes: Record<string, RouteThemeConfig>
): boolean {
	return getRouteTheme(pathname, routeThemes) !== null
}

/**
 * Get all routes that use a specific color scheme.
 *
 * Returns an array of route patterns that are configured to use the specified color scheme.
 * This is useful for finding all pages that use a particular theme variant or for
 * validation/debugging purposes (e.g., finding all routes using the 'spells' scheme).
 *
 * @param scheme - The color scheme to search for (e.g., 'default', 'spells')
 * @param routeThemes - Object mapping route patterns to theme configurations
 * @returns An array of route patterns (strings) that use the specified scheme.
 *          Returns an empty array if no routes use the given scheme
 *
 * @example
 * ```typescript
 * const routeThemes: Record<string, RouteThemeConfig> = {
 *   '/admin': {
 *     theme: { base: 'dark', scheme: 'default' },
 *     override: true
 *   },
 *   '/settings': {
 *     theme: { base: 'light', scheme: 'spells' },
 *     override: false
 *   },
 *   '/dashboard/*': {
 *     theme: { base: 'dark', scheme: 'spells' },
 *     override: false
 *   }
 * };
 *
 * // Find all routes using 'spells' scheme
 * const spellsRoutes = getRoutesForScheme('spells', routeThemes);
 * // Returns: ['/settings', '/dashboard/*']
 *
 * // Find all routes using 'default' scheme
 * const defaultRoutes = getRoutesForScheme('default', routeThemes);
 * // Returns: ['/admin']
 * ```
 *
 * @remarks
 * - Only considers explicitly configured route themes
 * - Returns route patterns as they are defined in the config (may include wildcards)
 * - Returns an empty array if no routes match the specified scheme
 * - Order of routes in the result may not be predictable
 *
 * @see {@link getRouteTheme} for getting the theme config for a specific route
 * @see {@link routeHasTheme} for checking if a route has any theme
 */
export function getRoutesForScheme(
	scheme: ThemeScheme,
	routeThemes: Record<string, RouteThemeConfig>
): string[] {
	return Object.entries(routeThemes)
		.filter(([ _, config ]) => config.theme.scheme === scheme)
		.map(([ route, _ ]) => route)
}

/**
 * Check if a route's theme should override user preferences.
 *
 * Determines whether the configured theme for a route should completely replace
 * the user's preferences (override=true) or whether it should respect the user's
 * base theme choice and only override the color scheme (override=false).
 * This is useful for conditional logic where certain routes must enforce specific themes.
 *
 * @param pathname - The URL path to check (e.g., '/admin', '/login')
 * @param routeThemes - Object mapping route patterns to theme configurations
 * @returns true if the route's theme overrides user preferences, false if the route
 *          respects user preferences or if the route has no configured theme
 *
 * @example
 * ```typescript
 * const routeThemes: Record<string, RouteThemeConfig> = {
 *   '/admin': {
 *     theme: { base: 'dark', scheme: 'default' },
 *     override: true  // Admin must always be dark
 *   },
 *   '/settings': {
 *     theme: { base: 'light', scheme: 'spells' },
 *     override: false  // Settings suggests light but respects user's theme
 *   }
 * };
 *
 * routeThemeOverrides('/admin', routeThemes); // true - forces dark theme
 * routeThemeOverrides('/settings', routeThemes); // false - respects user preference
 * routeThemeOverrides('/public', routeThemes); // false - no configured theme
 *
 * // Can be used for conditional behavior
 * if (routeThemeOverrides(currentPath, routeThemes)) {
 *   // Show warning that theme is locked for this route
 * }
 * ```
 *
 * @remarks
 * - Returns false if the route has no configured theme (safe default)
 * - Returns false if the route theme is found but override property is not set or false
 * - Returns true only if override property is explicitly true in route config
 * - Uses the same route matching as {@link getRouteTheme} (exact then wildcard)
 *
 * @see {@link getRouteTheme} for getting the full theme configuration
 * @see {@link routeHasTheme} for checking if a route has any theme
 * @see {@link applyRouteTheme} for applying route theme with override logic
 */
export function routeThemeOverrides(
	pathname: string,
	routeThemes: Record<string, RouteThemeConfig>
): boolean {
	const config = getRouteTheme(pathname, routeThemes)
	return config?.override ?? false
}
