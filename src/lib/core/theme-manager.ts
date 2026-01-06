/**
 * Theme Application System
 *
 * Bridges Svelte store state with CSS theming system, providing functions
 * to apply theme classes and handle system theme preference changes.
 */

import { isBrowser } from '../utils/browser'
import { getHtmlElement } from '../utils/dom'
import { logger } from '../utils/logger'
import { getRouteTheme, type RouteThemeConfig } from '../utils/route-themes'
import { prefersDarkMode,watchSystemTheme as watchSystemThemeUtil } from '../utils/system-theme'
import { applyFullTheme } from './scheme-registry'
import type { FullTheme, ThemeMode, ThemeScheme } from './types'

/**
 * Apply a theme with its associated color scheme to the document.
 *
 * This function combines a theme mode (light, dark, or system) with a color scheme
 * and immediately applies the necessary CSS classes to the document root element.
 * It ensures both the base theme and color scheme are properly synchronized on the page.
 *
 * @param theme - The theme mode to apply: 'light' (light theme), 'dark' (dark theme),
 *                or 'system' (follows OS preference)
 * @param scheme - The color scheme to use alongside the theme (e.g., 'default', 'spells').
 *                 Defaults to 'default' if not specified
 * @returns void
 *
 * @example
 * ```typescript
 * // Apply dark theme with spells color scheme
 * applyThemeWithScheme('dark', 'spells');
 *
 * // Apply light theme with default scheme
 * applyThemeWithScheme('light', 'default');
 *
 * // Apply system theme (respects OS preferences)
 * applyThemeWithScheme('system', 'default');
 * ```
 *
 * @see {@link watchSystemTheme} for monitoring OS theme preference changes
 * @see {@link initializeTheme} for complete theme system initialization
 */
export function applyThemeWithScheme(theme: ThemeMode, scheme: ThemeScheme): void {
	const fullTheme: FullTheme = { base: theme, scheme }
	applyFullTheme(fullTheme)
}

/**
 * Apply the resolved system theme preference
 */
function applySystemTheme(): void {
	const html = getHtmlElement()
	if (!html) return

	const isDark = prefersDarkMode()

	// Add resolved system theme class for immediate styling
	html.classList.remove('theme-system-light', 'theme-system-dark')
	html.classList.add(isDark ? 'theme-system-dark' : 'theme-system-light')
}

/**
 * Monitor OS-level theme preference changes and react with a callback.
 *
 * Sets up a listener for the system's color scheme preference (light or dark mode).
 * When the user changes their OS theme settings, the provided callback is invoked
 * with the new theme. This is useful for applications that want to follow the
 * system theme or react to theme changes at runtime. The function handles both
 * modern (addEventListener) and legacy (addListener) browser APIs for maximum compatibility.
 *
 * @param callback - Function to call when system theme changes. Receives either 'light' or 'dark'
 * @returns A cleanup function that removes the theme change listener when called.
 *          Call this function to stop monitoring theme changes and free resources
 *
 * @example
 * ```typescript
 * // Set up system theme watching
 * const unwatch = watchSystemTheme((systemTheme) => {
 *   console.log(`System theme changed to: ${systemTheme}`);
 *   if (document.documentElement.classList.contains('theme-system')) {
 *     applyThemeWithScheme('system', 'default');
 *   }
 * });
 *
 * // Later, clean up the watcher
 * unwatch();
 * ```
 *
 * @remarks
 * - Only operates in browser environments
 * - Automatically applies 'theme-system-light' or 'theme-system-dark' class if system theme is active
 * - Returns a no-op function in non-browser environments
 * - Uses modern MediaQueryList.addEventListener if available, falls back to addListener for older browsers
 *
 * @see {@link initializeTheme} for setting up complete theme system with watching
 * @see {@link applyThemeWithScheme} for manually applying theme changes
 */
export function watchSystemTheme(callback: (systemTheme: 'light' | 'dark') => void): () => void {
	if (!isBrowser()) return () => {}

	return watchSystemThemeUtil(isDark => {
		const systemTheme = isDark ? 'dark' : 'light'
		callback(systemTheme)

		// If system theme is currently active, update the resolved class
		const html = getHtmlElement()
		if (html?.classList.contains('theme-system')) {
			applySystemTheme()
		}
	})
}

/**
 * Initialize the complete theme system with stored preferences and system monitoring.
 *
 * This is the primary setup function that should be called once when your application
 * starts. It applies the user's previously saved theme preferences and sets up a listener
 * for OS-level theme preference changes. When system mode is active, the application
 * will automatically respond to OS theme changes.
 *
 * @param storedTheme - The user's preferred theme mode: 'light', 'dark', or 'system'.
 *                      This is typically loaded from localStorage or cookies
 * @param storedScheme - The user's preferred color scheme (defaults to 'default' if not specified).
 *                       Examples: 'default', 'spells'. Should match a scheme in your config
 * @returns A cleanup function that should be called during component unmount or app shutdown.
 *          Removes the system theme listener and frees resources
 *
 * @example
 * ```typescript
 * // In your SvelteKit +layout.svelte or app initialization code
 * import { initializeTheme } from '$lib/core/theme-manager';
 *
 * const cleanup = initializeTheme('system', 'default');
 *
 * // Optionally clean up when the component unmounts
 * onDestroy(() => {
 *   cleanup();
 * });
 * ```
 *
 * @remarks
 * - Must be called before any theme switching operations
 * - Only functions in browser environments; returns a no-op function in SSR contexts
 * - Applies CSS classes to the document root for styling based on active theme
 * - System theme changes only take effect if the 'theme-system' class is active
 * - All scheme CSS should be statically imported before calling this function
 *
 * @see {@link applyThemeWithScheme} for manually applying different themes
 * @see {@link watchSystemTheme} for monitoring theme changes separately
 */
export function initializeTheme(
	storedTheme: ThemeMode,
	storedScheme: ThemeScheme = 'default'
): () => void {
	if (!isBrowser()) return () => {}

	// All scheme CSS is statically imported - no preloading needed

	// Apply the stored theme and scheme immediately
	applyThemeWithScheme(storedTheme, storedScheme)

	// Set up system theme watching for when system mode is active
	const cleanup = watchSystemTheme(() => {
		// Only react if system theme is currently active
		const html = getHtmlElement()
		if (html?.classList.contains('theme-system')) {
			applySystemTheme()
		}
	})

	return cleanup
}

/**
 * Apply theme based on the current route configuration.
 *
 * This function determines which theme should be applied for a given route by:
 * 1. Checking if the route has a specific theme configuration
 * 2. Deciding whether the route theme overrides user preferences or is a suggestion
 * 3. Applying the resolved theme to the document
 *
 * Routes can either force a specific theme (override=true) or suggest a theme while
 * respecting the user's base theme choice (override=false). This enables use cases like
 * ensuring the admin panel always uses dark mode while letting users control light/dark/system.
 *
 * @param pathname - The current URL path (e.g., '/admin', '/home', '/settings')
 * @param userTheme - The user's preferred theme mode: 'light', 'dark', or 'system'
 * @param userScheme - The user's preferred color scheme (e.g., 'default', 'spells')
 * @param routeThemes - Object mapping route patterns to their theme configurations.
 *                      Supports wildcard patterns (e.g., '/admin/*' matches '/admin/users')
 * @returns The resolved FullTheme object that was applied, containing both the base theme
 *          and color scheme. This includes route overrides or suggestions merged with user preferences
 *
 * @example
 * ```typescript
 * // Define route-specific themes
 * const routeThemes: Record<string, RouteThemeConfig> = {
 *   '/admin': {
 *     theme: { base: 'dark', scheme: 'default' },
 *     override: true,
 *     description: 'Admin panel always uses dark mode'
 *   },
 *   '/settings': {
 *     theme: { base: 'light', scheme: 'spells' },
 *     override: false,
 *     description: 'Settings page suggests light theme with spells scheme'
 *   }
 * };
 *
 * // Apply theme for current route
 * const applied = applyRouteTheme(
 *   '/admin/users',
 *   'light', // user preference
 *   'default',
 *   routeThemes
 * );
 * // Result: dark theme from admin route config (override=true ignores user preference)
 * ```
 *
 * @remarks
 * - Route patterns support wildcards: '/admin/*' matches '/admin/users', '/admin/settings', etc.
 * - Direct route matches are checked before wildcard patterns
 * - When override=false, only the color scheme from route config is used; the user's base theme is preserved
 * - Logs route theme resolution for debugging purposes
 * - If no route theme is found, applies the user's preferences
 *
 * @see {@link getRouteTheme} for checking if a route has a specific theme
 * @see {@link routeThemeOverrides} for checking if a route forces theme override
 * @see {@link applyThemeWithScheme} for manually applying specific themes
 */
export function applyRouteTheme(
	pathname: string,
	userTheme: ThemeMode,
	userScheme: ThemeScheme,
	routeThemes: Record<string, RouteThemeConfig>
): FullTheme {
	const routeConfig = getRouteTheme(pathname, routeThemes)

	logger.info('Route theme check', {
		pathname,
		routeConfig: routeConfig
			? {
				theme: routeConfig.theme,
				override: routeConfig.override,
				description: routeConfig.description
			}
			: null,
		userTheme,
		userScheme
	})

	if (routeConfig) {
		if (routeConfig.override) {
			// Route overrides user preferences
			logger.info('Applying route theme override', {
				pathname,
				routeTheme: routeConfig.theme,
				userTheme: { base: userTheme, scheme: userScheme }
			})
			applyFullTheme(routeConfig.theme)
			return routeConfig.theme
		} else {
			// Route suggests theme but respects user preferences for base theme
			const suggestedTheme: FullTheme = {
				base: userTheme,
				scheme: routeConfig.theme.scheme
			}
			logger.info('Applying route theme suggestion', {
				pathname,
				suggestedTheme,
				userTheme: { base: userTheme, scheme: userScheme }
			})
			applyFullTheme(suggestedTheme)
			return suggestedTheme
		}
	} else {
		// No route theme, use user preferences
		logger.debug('No route theme found, using user preferences', { pathname })
		const userFullTheme: FullTheme = { base: userTheme, scheme: userScheme }
		applyFullTheme(userFullTheme)
		return userFullTheme
	}
}
