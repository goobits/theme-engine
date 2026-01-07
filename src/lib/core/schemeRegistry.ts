/**
 * Theme Scheme Management System
 *
 * Provides utilities for managing theme schemes alongside base themes,
 * supporting both route-specific automatic application and global user selection.
 */

import {
	applySchemeClass,
	getHtmlElement,
	removeSchemeClasses,
	removeThemeClasses,
	setDataThemeAttribute
} from '../utils/dom.js'
import { logger } from '../utils/logger.js'
import { prefersDarkMode } from '../utils/systemTheme.js'
import type { SchemeConfig } from './config.js'
import { resolveTheme, THEME_TRANSITION_DURATION_MS } from './constants.js'

/**
 * Theme mode representing the user's light/dark preference.
 *
 * - `'light'` - Force light theme regardless of system preference
 * - `'dark'` - Force dark theme regardless of system preference
 * - `'system'` - Follow the user's operating system preference
 *
 * @example
 * ```typescript
 * const userTheme: ThemeMode = 'system'; // Respects OS dark mode setting
 * ```
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * Theme color scheme identifier.
 *
 * Schemes provide distinct visual identities while maintaining
 * the same light/dark mode behavior. Each scheme maps to a CSS
 * class (`scheme-{name}`) applied to the document root.
 *
 * This type is extensible - you can use any string value to define
 * custom scheme names without type casts.
 *
 * @example
 * ```typescript
 * const scheme: ThemeScheme = 'spells'; // Applies .scheme-spells class
 * const custom: ThemeScheme = 'ocean'; // Custom scheme, no cast needed
 * ```
 */
export type ThemeScheme = string

/**
 * Built-in scheme names provided by the library.
 *
 * These schemes are included with the library and have
 * corresponding CSS definitions.
 *
 * - `'default'` - Clean, minimal design system
 * - `'spells'` - Magical purple theme for enchanted experiences
 *
 * @example
 * ```typescript
 * const builtIn: BuiltInScheme = 'default';
 * ```
 */
export type BuiltInScheme = 'default' | 'spells'

/**
 * Complete theme configuration combining mode and scheme.
 *
 * Represents the full theme state applied to the application.
 * The `base` property controls light/dark appearance, while
 * `scheme` determines the color palette and visual style.
 *
 * @example
 * ```typescript
 * const theme: FullTheme = {
 *   base: 'dark',      // Dark mode
 *   scheme: 'spells'   // With magical purple colors
 * };
 * ```
 */
export interface FullTheme {

	/** Theme mode: 'light', 'dark', or 'system' */
	base: ThemeMode

	/** Color scheme identifier */
	scheme: ThemeScheme
}

// Track the transition timeout to cancel it on rapid theme changes
let transitionTimeoutId: ReturnType<typeof setTimeout> | undefined

// Available theme schemes
export const THEME_SCHEMES: Record<ThemeScheme, SchemeConfig> = {
	default: {
		name: 'default',
		displayName: 'Default',
		description: 'Clean, minimal design system',
		icon: '🤖', // Robot icon for default theme
		title: 'Prompt Library', // Default title
		preview: {
			primary: '#007aff',
			accent: '#5856d6',
			background: '#ffffff'
		}
	},
	spells: {
		name: 'spells',
		displayName: 'Grimoire',
		description: 'Magical purple theme for enchanted experiences',
		icon: '✨', // Sparkles for magical theme
		title: 'Spell Library', // Magical title
		preview: {
			primary: '#7c3aed',
			accent: '#a78bfa',
			background: '#0a0a0f'
		}

		// Note: CSS is loaded via import in design-tokens.css, not dynamically
	}
}

/**
 * Applies a theme scheme to the document root element.
 *
 * Removes all existing scheme classes and applies the specified scheme.
 * Only operates in browser environment; no-op on server.
 *
 * @param scheme - The theme scheme to apply ('default', 'spells', or custom scheme)
 *
 * @example
 * ```typescript
 * // Switch to the spells color scheme
 * applyThemeScheme('spells');
 *
 * // Switch back to default scheme
 * applyThemeScheme('default');
 *
 * // Use a custom scheme
 * applyThemeScheme('ocean'); // No type cast needed!
 * ```
 *
 * @see {@link applyFullTheme} for applying both theme mode and scheme together
 */
export function applyThemeScheme(scheme: ThemeScheme): void {
	const html = getHtmlElement()
	if (!html) return

	// Remove ALL existing scheme classes and apply new one
	removeSchemeClasses(html)
	applySchemeClass(html, scheme)

	logger.debug('Theme scheme applied', { scheme })
}

/**
 * Applies a complete theme configuration to the document root.
 *
 * This is the primary function for theme application. It handles:
 * - Base theme mode (light/dark/system) with automatic system preference resolution
 * - Color scheme application
 * - `data-theme` attribute for CSS targeting (always "light" or "dark", never "system")
 * - CSS class management for both theme and scheme
 * - Smooth transitions (disables transitions briefly to prevent visual glitches)
 *
 * Only operates in browser environment; no-op on server.
 *
 * @param fullTheme - Complete theme configuration
 * @param fullTheme.base - Base theme mode: 'light', 'dark', or 'system'
 * @param fullTheme.scheme - Color scheme identifier (e.g., 'default', 'spells')
 *
 * @example
 * ```typescript
 * // Apply dark theme with spells color scheme
 * applyFullTheme({ base: 'dark', scheme: 'spells' });
 *
 * // Apply system theme (auto light/dark) with default scheme
 * applyFullTheme({ base: 'system', scheme: 'default' });
 *
 * // Apply light theme
 * applyFullTheme({ base: 'light', scheme: 'default' });
 * ```
 *
 * @remarks
 * When base is 'system', the function queries the system preference
 * to determine the user's preference and applies the appropriate resolved theme.
 * The `data-theme` attribute will always be set to either "light" or "dark" for CSS targeting.
 *
 * @see {@link applyThemeScheme} for applying only the color scheme
 * @see {@link getCurrentScheme} for reading the current scheme
 */
export function applyFullTheme(fullTheme: FullTheme): void {
	const html = getHtmlElement()
	if (!html) return

	// Temporarily disable transitions for instant theme switching
	html.classList.add('theme-switching')

	// Cancel any pending transition timeout to prevent race conditions
	if (transitionTimeoutId !== undefined) {
		clearTimeout(transitionTimeoutId)
	}

	// Clear existing theme and scheme classes
	removeThemeClasses(html)
	removeSchemeClasses(html)

	// Apply base theme classes
	if (fullTheme.base === 'system') {
		html.classList.add('theme-system')
		const isDark = prefersDarkMode()
		html.classList.add(isDark ? 'theme-system-dark' : 'theme-system-light')
	} else {
		html.classList.add(`theme-${ fullTheme.base }`)
	}

	// Apply scheme class
	applySchemeClass(html, fullTheme.scheme)

	// Set data-theme to resolved value (always "light" or "dark", never "system")
	const isDark = fullTheme.base === 'system' ? prefersDarkMode() : false
	const resolvedTheme = resolveTheme(fullTheme.base, isDark)
	setDataThemeAttribute(html, resolvedTheme)

	// Re-enable transitions after brief delay
	transitionTimeoutId = setTimeout(() => {
		html.classList.remove('theme-switching')
		transitionTimeoutId = undefined
	}, THEME_TRANSITION_DURATION_MS)

	// Enhanced debugging for theme application
	const appliedClasses = Array.from(html.classList).filter(
		cls => cls.startsWith('theme-') || cls.startsWith('scheme-')
	)

	logger.info('Full theme applied successfully', {
		fullTheme,
		appliedClasses,
		dataTheme: html.dataset.theme,
		htmlElement: html.tagName
	})
}

/**
 * Retrieves the currently active theme scheme from the document.
 *
 * Reads the scheme class from the document root element (e.g., `scheme-default`, `scheme-spells`)
 * and returns the corresponding scheme identifier. Returns 'default' if no scheme class is found
 * or if running on the server.
 *
 * @returns The active theme scheme identifier, or 'default' as fallback
 *
 * @example
 * ```typescript
 * const currentScheme = getCurrentScheme();
 * console.log(currentScheme); // 'default' or 'spells'
 *
 * // Use in conditional logic
 * if (getCurrentScheme() === 'spells') {
 *   console.log('Using magical theme!');
 * }
 * ```
 *
 * @see {@link applyThemeScheme} for setting the scheme
 * @see {@link applyFullTheme} for applying theme and scheme together
 */
export function getCurrentScheme(): ThemeScheme {
	const html = getHtmlElement()
	if (!html) return 'default'

	for (const scheme of Object.keys(THEME_SCHEMES)) {
		if (html.classList.contains(`scheme-${ scheme }`)) {
			return scheme
		}
	}

	return 'default'
}

/**
 * All scheme CSS is now statically imported in design-tokens.css
 * No dynamic loading needed - schemes are always available
 */
