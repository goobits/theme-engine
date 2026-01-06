/**
 * Theme Configuration Module
 *
 * Provides configuration validation and creation utilities for the theme engine.
 * Use {@link createThemeConfig} to define your application's theme schemes.
 *
 * @module config
 */

import { DEV } from 'esm-env'

import { logger } from '../utils/logger'
import type { RouteThemeConfig } from '../utils/route-themes'
import { isValidHexColor } from '../utils/validation'
import type { SchemeConfig } from './types'

/**
 * Default preview colors for schemes that don't specify their own
 */
const DEFAULT_PREVIEW_COLORS = {
	primary: '#3b82f6',
	accent: '#8b5cf6',
	background: '#ffffff'
} as const

/**
 * Root configuration object for the theme engine.
 *
 * Defines available color schemes and optional route-based theme overrides.
 * Pass this configuration to {@link createThemeConfig} for validation.
 *
 * @example
 * ```typescript
 * const config: ThemeConfig = {
 *   schemes: {
 *     default: {
 *       name: 'default',
 *       displayName: 'Default',
 *       description: 'Clean design',
 *       preview: { primary: '#007aff', accent: '#5856d6', background: '#fff' }
 *     }
 *   },
 *   routeThemes: {
 *     '/admin/*': {
 *       theme: { base: 'dark', scheme: 'default' },
 *       override: true
 *     }
 *   }
 * };
 * ```
 */
export interface ThemeConfig {

	/** Available color schemes keyed by scheme identifier */
	schemes: Record<string, SchemeConfig>;

	/** Optional route-specific theme configurations */
	routeThemes?: Record<string, RouteThemeConfig>;
}

/**
 * Validates and returns preview colors for a scheme, or null if invalid/missing
 */
function validatePreviewColors(
	name: string,
	preview: unknown
): { primary: string; accent: string; background: string } | null {
	if (!preview || typeof preview !== 'object') {
		return null
	}

	const colors = preview as Record<string, unknown>
	const { primary, accent, background } = colors

	// Check that all colors are strings
	if (
		typeof primary !== 'string' ||
        typeof accent !== 'string' ||
        typeof background !== 'string'
	) {
		return null
	}

	// Validate each color format
	let hasInvalidColor = false

	if (!isValidHexColor(primary)) {
		logger.warn(
			`[themes] Warning: Invalid primary color for scheme "${ name }": "${ primary }". ` +
                'Expected 6-digit hex format like "#3b82f6". Using default.'
		)
		hasInvalidColor = true
	}

	if (!isValidHexColor(accent)) {
		logger.warn(
			`[themes] Warning: Invalid accent color for scheme "${ name }": "${ accent }". ` +
                'Expected 6-digit hex format like "#8b5cf6". Using default.'
		)
		hasInvalidColor = true
	}

	if (!isValidHexColor(background)) {
		logger.warn(
			`[themes] Warning: Invalid background color for scheme "${ name }": "${ background }". ` +
                'Expected 6-digit hex format like "#ffffff". Using default.'
		)
		hasInvalidColor = true
	}

	// Only return colors if all are valid
	if (hasInvalidColor) {
		return null
	}

	return { primary, accent, background }
}

/**
 * Validates and transforms a scheme configuration, applying defaults for missing fields
 */
function validateScheme(key: string, scheme: unknown): SchemeConfig | null {
	if (!scheme || typeof scheme !== 'object') {
		logger.warn(`[themes] Invalid scheme "${ key }": scheme must be an object`)
		return null
	}

	const schemeObj = scheme as Record<string, unknown>

	// Warn if name doesn't match key (but use key as the source of truth)
	if (schemeObj.name && schemeObj.name !== key) {
		logger.warn(
			`[themes] Warning: Scheme key "${ key }" doesn't match scheme.name "${ schemeObj.name }". ` +
                `Using key "${ key }" as the scheme name.`
		)
	}

	// Apply defaults for optional fields
	const displayName =
        typeof schemeObj.displayName === 'string'
        	? schemeObj.displayName
        	: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize name as default

	const description = typeof schemeObj.description === 'string' ? schemeObj.description : ''

	const preview = validatePreviewColors(key, schemeObj.preview) ?? DEFAULT_PREVIEW_COLORS

	// Build complete scheme config with defaults applied
	const result: SchemeConfig = {
		name: key,
		displayName,
		description,
		preview
	}

	// Preserve optional fields if provided
	if (typeof schemeObj.icon === 'string') {
		result.icon = schemeObj.icon
	}

	if (typeof schemeObj.title === 'string') {
		result.title = schemeObj.title
	}

	if (typeof schemeObj.cssFile === 'string') {
		result.cssFile = schemeObj.cssFile
	}

	return result
}

/**
 * Validates and transforms all schemes in the configuration
 */
function validateSchemes(schemes: unknown): Record<string, SchemeConfig> {
	if (!schemes || typeof schemes !== 'object') {
		logger.warn(
			'[themes] Invalid config: "schemes" must be an object. ' +
                'Example: { schemes: { default: {} } }'
		)
		return {}
	}

	const schemeKeys = Object.keys(schemes)
	if (schemeKeys.length === 0) {
		logger.warn(
			'[themes] Warning: No schemes defined in config. ' +
                'Your theme system will not work without at least one scheme. ' +
                'Add a scheme like: { schemes: { default: {} } }'
		)
		return {}
	}

	// Validate and transform each scheme
	const validatedSchemes: Record<string, SchemeConfig> = {}
	for (const [ key, scheme ] of Object.entries(schemes)) {
		const validatedScheme = validateScheme(key, scheme)
		if (validatedScheme) {
			validatedSchemes[key] = validatedScheme
		}
	}

	return validatedSchemes
}

/**
 * Validates route theme configurations
 */
function validateRouteThemes(routeThemes: unknown): void {
	if (!routeThemes || typeof routeThemes !== 'object') {
		return
	}

	for (const [ route, routeConfig ] of Object.entries(routeThemes)) {
		if (!routeConfig || typeof routeConfig !== 'object') {
			logger.warn(`[themes] Invalid route theme for "${ route }": must be an object`)
			continue
		}

		const config = routeConfig as Record<string, unknown>
		if (!config.theme) {
			logger.warn(
				`[themes] Warning: Route theme for "${ route }" missing "theme" property. ` +
                    'Add: theme: { base: "dark", scheme: "default" }'
			)
		}
	}
}

/**
 * Validates and transforms theme configuration in development mode
 */
function validateConfig(config: ThemeConfig): ThemeConfig {
	// Skip validation in production for performance
	if (!DEV) {
		return config
	}

	const validatedSchemes = validateSchemes(config.schemes)

	if (config.routeThemes) {
		validateRouteThemes(config.routeThemes)
	}

	return {
		...config,
		schemes: validatedSchemes
	}
}

/**
 * Creates and validates a theme configuration.
 *
 * In development mode, this function performs comprehensive validation, applies
 * defaults for missing fields, and logs warnings for configuration issues.
 * In production, validation is skipped for performance.
 *
 * @param config - The theme configuration object
 * @returns The validated and normalized configuration with defaults applied
 *
 * @example
 * ```typescript
 * // Minimal configuration with defaults
 * const config = createThemeConfig({
 *   schemes: {
 *     default: {}, // Uses all defaults
 *     custom: {
 *       displayName: 'My Theme', // Optional customization
 *     }
 *   }
 * });
 *
 * // Full configuration
 * const fullConfig = createThemeConfig({
 *   schemes: {
 *     default: {
 *       name: 'default',
 *       displayName: 'Default',
 *       description: 'Clean, minimal design',
 *       preview: {
 *         primary: '#3b82f6',
 *         accent: '#8b5cf6',
 *         background: '#ffffff'
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @remarks
 * **Default Values:**
 * - `displayName`: Capitalized scheme name (e.g., "default" → "Default")
 * - `description`: Empty string
 * - `preview`: Blue color scheme (primary: #3b82f6, accent: #8b5cf6, background: #ffffff)
 *
 * **Color Format Requirements:**
 * - Preview colors must be 6-digit hex format (`#RRGGBB`)
 * - 3-digit hex format (`#RGB`) is NOT supported
 * - Color values are case-insensitive
 * - Examples: `#3b82f6` ✅ | `#fff` ❌ | `#FFFFFF` ✅
 *
 * **Validation Behavior:**
 * - Validation runs only in development mode (detected via esm-env)
 * - In production builds, validation is skipped for performance
 * - Invalid configurations log warnings but do not throw errors
 */
export function createThemeConfig(config: ThemeConfig): ThemeConfig {
	return validateConfig(config)
}
