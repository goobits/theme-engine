/**
 * Theme Configuration Module
 *
 * Provides configuration validation and creation utilities for the theme engine.
 * Use {@link createThemeConfig} to define your application's theme schemes.
 *
 * @module config
 */

import { createLogger } from '@goobits/logger'

import type { RouteThemeConfig } from '../utils/routeThemes.js'
import { isValidHexColor } from '../utils/validation.js'
import { PREFERENCE_COOKIE_NAMES, STORAGE_KEY } from './constants.js'
import type { ThemeMode, ThemeScheme } from './schemeRegistry.js'

const logger = createLogger('@goobits/themes:config')

/**
 * Default preview colors for schemes that don't specify their own
 */
const DEFAULT_PREVIEW_COLORS = {
	primary: '#3b82f6',
	accent: '#8b5cf6',
	background: '#ffffff'
} as const

/**
 * Configuration for a color scheme.
 *
 * Defines the metadata and preview colors for a theme scheme.
 * Used by the theme picker UI and for validation.
 *
 * @example
 * ```typescript
 * const spellsConfig: SchemeConfig = {
 *   name: 'spells',
 *   displayName: 'Grimoire',
 *   description: 'Magical purple theme',
 *   icon: '✨',
 *   title: 'Spell Library',
 *   preview: {
 *     primary: '#7c3aed',
 *     accent: '#a78bfa',
 *     background: '#0a0a0f'
 *   }
 * };
 * ```
 */
export interface SchemeConfig {

	/** Internal scheme identifier (should match the key in schemes record) */
	name: string

	/** Human-readable name shown in UI */
	displayName: string

	/** Brief description of the scheme's visual style */
	description: string

	/** Optional emoji or icon character for visual identification */
	icon?: string

	/** Optional custom page title when this scheme is active */
	title?: string

	/** Preview colors for theme picker thumbnails */
	preview: {

		/** Primary brand color in 6-digit hex format (#RRGGBB) */
		primary: string

		/** Accent/secondary color in 6-digit hex format */
		accent: string

		/** Background color in 6-digit hex format */
		background: string
	}

	/** Optional path to additional CSS file for this scheme */
	cssFile?: string

	/** Optional light/dark mode enforced whenever this scheme is active */
	fixedMode?: Exclude<ThemeMode, 'system'>
}

/** Input accepted by {@link createThemeConfig} before defaults are applied. */
export type SchemeConfigInput = Partial<Omit<SchemeConfig, 'name'>> & { name?: string }

/** Browser persistence names used by the theme engine. */
export interface ThemePersistenceConfig {

	/** Local-storage key containing the canonical JSON preference object */
	storageKey?: string

	/** Cookie containing the light/dark/system mode */
	themeCookie?: string

	/** Cookie containing the active scheme */
	schemeCookie?: string

	/** Optional legacy local-storage key containing only a scheme identifier */
	legacySchemeStorageKey?: string
}

/** Fully resolved browser persistence names. */
export interface ResolvedThemePersistenceConfig {
	storageKey: string
	themeCookie: string
	schemeCookie: string
	legacySchemeStorageKey?: string
}

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
	schemes: Record<string, SchemeConfig>

	/** Optional route-specific theme configurations */
	routeThemes?: Record<string, RouteThemeConfig>

	/** Default light/dark/system mode when no valid preference exists */
	defaultMode?: ThemeMode

	/** Default scheme when no valid preference exists */
	defaultScheme?: ThemeScheme

	/** Historical scheme identifiers mapped to their canonical identifiers */
	schemeAliases?: Record<string, ThemeScheme>

	/** Browser storage and cookie names */
	persistence?: ThemePersistenceConfig
}

/** Input shape accepted by {@link createThemeConfig}. */
export interface ThemeConfigInput extends Omit<ThemeConfig, 'schemes'> {
	schemes: Record<string, SchemeConfigInput>
}

/** Stable package defaults used when consumers do not provide a custom config. */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
	schemes: {
		default: {
			name: 'default',
			displayName: 'Default',
			description: '',
			preview: {
				primary: '#3b82f6',
				accent: '#8b5cf6',
				background: '#ffffff'
			}
		},
		spells: {
			name: 'spells',
			displayName: 'Grimoire',
			description: 'Magical purple theme',
			preview: {
				primary: '#7c3aed',
				accent: '#a78bfa',
				background: '#0a0a0f'
			}
		}
	},
	defaultMode: 'system',
	defaultScheme: 'default'
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
	if (typeof primary !== 'string' || typeof accent !== 'string' || typeof background !== 'string') {
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
	if (schemeObj['name'] && schemeObj['name'] !== key) {
		logger.warn(
			`[themes] Warning: Scheme key "${ key }" doesn't match scheme.name "${ schemeObj['name'] }". ` +
				`Using key "${ key }" as the scheme name.`
		)
	}

	// Apply defaults for optional fields
	const displayName =
		typeof schemeObj['displayName'] === 'string'
			? schemeObj['displayName']
			: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize name as default

	const description = typeof schemeObj['description'] === 'string' ? schemeObj['description'] : ''

	const preview = validatePreviewColors(key, schemeObj['preview']) ?? DEFAULT_PREVIEW_COLORS

	// Build complete scheme config with defaults applied
	const result: SchemeConfig = {
		name: key,
		displayName,
		description,
		preview
	}

	// Preserve optional fields if provided
	if (typeof schemeObj['icon'] === 'string') {
		result.icon = schemeObj['icon']
	}

	if (typeof schemeObj['title'] === 'string') {
		result.title = schemeObj['title']
	}

	if (typeof schemeObj['cssFile'] === 'string') {
		result.cssFile = schemeObj['cssFile']
	}

	if (schemeObj['fixedMode'] === 'light' || schemeObj['fixedMode'] === 'dark') {
		result.fixedMode = schemeObj['fixedMode']
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
		if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
			logger.warn(`[themes] Ignoring unsafe scheme identifier "${ key }"`)
			continue
		}
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
		if (!config['theme']) {
			logger.warn(
				`[themes] Warning: Route theme for "${ route }" missing "theme" property. ` +
					'Add: theme: { base: "dark", scheme: "default" }'
			)
		}
	}
}

const THEME_MODES: readonly ThemeMode[] = [ 'light', 'dark', 'system' ]
const SAFE_PERSISTENCE_NAME = /^[a-zA-Z0-9._:-]+$/

/** Returns the configured default scheme, falling back to the first available scheme. */
export function getDefaultThemeScheme(config: ThemeConfig): ThemeScheme {
	if (config.defaultScheme && config.schemes[config.defaultScheme]) {
		return config.defaultScheme
	}
	return Object.keys(config.schemes)[0] || 'default'
}

/** Returns the configured default mode. */
export function getDefaultThemeMode(config: ThemeConfig): ThemeMode {
	return config.defaultMode && THEME_MODES.includes(config.defaultMode)
		? config.defaultMode
		: 'system'
}

/** Resolves browser persistence names with stable package defaults. */
export function getThemePersistenceConfig(config: ThemeConfig): ResolvedThemePersistenceConfig {
	const persistence = config.persistence
	const validName = (value: string | undefined, fallback: string) =>
		value && SAFE_PERSISTENCE_NAME.test(value) ? value : fallback
	const legacySchemeStorageKey =
		persistence?.legacySchemeStorageKey &&
		SAFE_PERSISTENCE_NAME.test(persistence.legacySchemeStorageKey)
			? persistence.legacySchemeStorageKey
			: undefined

	return {
		storageKey: validName(persistence?.storageKey, STORAGE_KEY),
		themeCookie: validName(persistence?.themeCookie, PREFERENCE_COOKIE_NAMES.theme),
		schemeCookie: validName(persistence?.schemeCookie, PREFERENCE_COOKIE_NAMES.themeScheme),
		...(legacySchemeStorageKey ? { legacySchemeStorageKey } : {})
	}
}

/** Resolves a persisted or historical scheme identifier to a configured scheme. */
export function resolveThemeScheme(config: ThemeConfig, value: unknown): ThemeScheme {
	const requested = typeof value === 'string' ? value : ''
	const canonical = config.schemeAliases?.[requested] ?? requested
	return config.schemes[canonical] ? canonical : getDefaultThemeScheme(config)
}

/** Resolves a mode and applies any mode enforced by the active scheme. */
export function resolveThemeMode(
	config: ThemeConfig,
	value: unknown,
	scheme: ThemeScheme
): ThemeMode {
	const fixedMode = config.schemes[scheme]?.fixedMode
	if (fixedMode) return fixedMode
	return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)
		? (value as ThemeMode)
		: getDefaultThemeMode(config)
}

/** Normalizes untrusted or partial preferences against the configured schemes. */
export function resolveThemePreferences(
	config: ThemeConfig,
	preferences: { theme?: unknown; themeScheme?: unknown }
): { theme: ThemeMode; themeScheme: ThemeScheme } {
	const themeScheme = resolveThemeScheme(config, preferences.themeScheme)
	return {
		theme: resolveThemeMode(config, preferences.theme, themeScheme),
		themeScheme
	}
}

function validateAliases(
	aliases: Record<string, ThemeScheme> | undefined,
	schemes: Record<string, SchemeConfig>
): Record<string, ThemeScheme> | undefined {
	if (!aliases) return undefined
	const validated = Object.fromEntries(
		Object.entries(aliases).filter(([ alias, target ]) => {
			const valid = /^[a-zA-Z0-9_-]+$/.test(alias) && Boolean(schemes[target])
			if (!valid) {
				logger.warn(`[themes] Ignoring invalid scheme alias "${ alias }"`)
			}
			return valid
		})
	)
	return Object.keys(validated).length > 0 ? validated : undefined
}

function validateConfig(config: ThemeConfigInput): ThemeConfig {
	const { schemeAliases: inputSchemeAliases, ...configWithoutAliases } = config
	const schemes = validateSchemes(configWithoutAliases.schemes)
	if (configWithoutAliases.routeThemes) {
		validateRouteThemes(configWithoutAliases.routeThemes)
	}

	const defaultScheme =
		configWithoutAliases.defaultScheme && schemes[configWithoutAliases.defaultScheme]
			? configWithoutAliases.defaultScheme
			: Object.keys(schemes)[0] || 'default'
	const defaultMode =
		configWithoutAliases.defaultMode && THEME_MODES.includes(configWithoutAliases.defaultMode)
			? configWithoutAliases.defaultMode
			: 'system'
	const schemeAliases = validateAliases(inputSchemeAliases, schemes)

	return {
		...configWithoutAliases,
		schemes,
		defaultMode,
		defaultScheme,
		...(schemeAliases ? { schemeAliases } : {}),
		persistence: getThemePersistenceConfig({ ...configWithoutAliases, schemes })
	}
}

/**
 * Creates and validates a theme configuration.
 *
 * This function performs validation and applies defaults in every environment,
 * so server and browser runtimes always receive the same normalized contract.
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
 * Invalid configurations log warnings and fall back to safe defaults.
 */
export function createThemeConfig(config: ThemeConfigInput): ThemeConfig {
	return validateConfig(config)
}
