/**
 * GooTheme - Modern CSS custom properties theming system
 *
 * Simple, real-time theming using native CSS variables.
 * Supports presets, persistence, system preferences, and live updates.
 *
 * @example
 * import { GooTheme } from '@goobits/themes/goo'
 *
 * // Set theme colors
 * GooTheme.set({ accent: '#1fa4cc', bg: '#1a1a1a' })
 *
 * // Use preset
 * GooTheme.preset('dark-blue')
 *
 * // Real-time color picker
 * picker.oninput = (e) => GooTheme.set('accent', e.target.value)
 */

import { logger } from '../utils/logger.js'
import { createEmitter, type Handler as EventCallback } from './_emitter.js'
import {
	alpha as alphaColor,
	bestContrast as rawBestContrast,
	blendColors,
	contrast as rawContrast,
	contrastInfo as rawContrastInfo,
	contrastWithAlpha,
	darken as darkenColor,
	getLuminance,
	isReadable as rawIsReadable,
	lighten as lightenColor,
	parseColor,
	type RGB,
	rgbToHex
} from './color/index.js'
import { createPersistence, type ThemePersistence } from './persistence.js'
import { presets, type ThemeColors } from './presets.js'

// =============================================================================
// Types
// =============================================================================

/** Options for initializing GooTheme */
export interface ThemeOptions {

	/** Root element for CSS variables (default: document.documentElement) */
	root?: HTMLElement

	/** CSS variable prefix (default: '--goo-theme-') */
	prefix?: string

	/** Initial theme preset name or color object */
	initial?: string | Partial<ThemeColors>

	/** Enable localStorage persistence (true or custom key) */
	persist?: boolean | string

	/** Follow system dark/light preference */
	auto?: boolean | { light?: string; dark?: string }
}

/** Auto mode preset mapping */
interface AutoPresets {
	light: string
	dark: string
}

// =============================================================================
// State
// =============================================================================

let prefix = '--goo-theme-'
let root: HTMLElement | null = null
let persistence: ThemePersistence | null = null
let darkModeQuery: MediaQueryList | null = null
let autoPresets: AutoPresets | null = null

const current: Partial<ThemeColors> = {}
const events = createEmitter(error => logger.error('Theme event handler error:', error))

// =============================================================================
// Utilities
// =============================================================================

/** Convert camelCase to kebab-case for CSS custom property names */
const toKebabCase = (str: string): string =>
	str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

/** Resolve a color that may be a theme key */
const resolveColor = (color: string): string =>
	current[color as keyof ThemeColors] || color

// =============================================================================
// Core API
// =============================================================================

/** Initialize the theme system */
const init = (options: ThemeOptions = {}): void => {
	root = options.root || document.documentElement

	if (options.prefix) {
		prefix = options.prefix.startsWith('--') ? options.prefix : `--${ options.prefix }`
	}

	// Restore from storage first
	if (options.persist) {
		const key = typeof options.persist === 'string' ? options.persist : 'goo-theme'
		persistence = createPersistence(key)
		const saved = persistence.restore()
		if (saved) {
			set(saved)
		}
	}

	// Then apply initial if no stored theme
	if (options.initial && Object.keys(current).length === 0) {
		if (typeof options.initial === 'string') {
			preset(options.initial)
		} else {
			set(options.initial)
		}
	}

	// Setup auto dark/light mode
	if (options.auto) {
		auto(options.auto === true ? undefined : options.auto)
	}
}

/**
 * Set theme value(s).
 *
 * @example
 * GooTheme.set('accent', '#1fa4cc')
 * GooTheme.set({ bg: '#1a1a1a', fg: '#ffffff' })
 */
const set = (keyOrObject: string | Partial<ThemeColors>, value?: string): void => {
	if (!root) {
		root = document.documentElement
	}

	const changes: Partial<ThemeColors> = typeof keyOrObject === 'string'
		? { [keyOrObject]: value } as Partial<ThemeColors>
		: keyOrObject

	// Apply changes
	for (const [ key, val ] of Object.entries(changes)) {
		if (val === undefined) continue

		const oldValue = current[key as keyof ThemeColors]
		const currentRecord = current as Record<string, string>
		currentRecord[key] = val

		// Convert camelCase to kebab-case for CSS variable names
		const cssKey = toKebabCase(key)
		root.style.setProperty(`${ prefix }${ cssKey }`, val)

		// Emit specific change event
		events.emit(`change:${ key }`, val, oldValue)
	}

	// Emit general change event
	events.emit('change', { ...current })

	// Persist if enabled
	persistence?.save(current)
}

/**
 * Get theme value(s).
 *
 * @example
 * GooTheme.get('accent')  // '#1fa4cc'
 * GooTheme.get()          // { bg, fg, accent, ... }
 */
const get = (key?: string): string | Partial<ThemeColors> | undefined => {
	if (key) {
		return current[key as keyof ThemeColors]
	}
	return { ...current }
}

/** Apply a preset theme */
const preset = (name: string): void => {
	const theme = presets[name]
	if (!theme) {
		logger.warn(`Unknown preset "${ name }"`)
		return
	}
	set(theme)
	events.emit('preset', name)
}

/** Register a custom preset */
const register = (name: string, theme: ThemeColors): void => {
	presets[name] = theme
}

/** List available preset names */
const getPresets = (): string[] => Object.keys(presets)

/** Follow system dark/light mode preference */
const auto = (options: { light?: string; dark?: string } = {}): void => {
	autoPresets = {
		light: options.light || 'light',
		dark: options.dark || 'dark'
	}

	darkModeQuery = globalThis.matchMedia?.('(prefers-color-scheme: dark)')

	if (darkModeQuery) {
		applySystemPreference()
		darkModeQuery.addEventListener('change', applySystemPreference)
	}
}

/** Apply theme based on system preference */
const applySystemPreference = (): void => {
	if (!autoPresets || !darkModeQuery) return
	const presetName = darkModeQuery.matches ? autoPresets.dark : autoPresets.light
	preset(presetName)
}

/** Check if current theme is dark */
const isDark = (): boolean => {
	const bg = current.bg
	if (!bg) return true
	return getLuminance(bg) < 0.5
}

/** Check if current theme is light */
const isLight = (): boolean => !isDark()

/** Enable localStorage persistence */
const persist = (key = 'goo-theme'): void => {
	persistence = createPersistence(key)
	persistence.save(current)
}

/** Restore theme from localStorage */
const restore = (): boolean => {
	if (!persistence) return false
	const saved = persistence.restore()
	if (saved) {
		set(saved)
		return true
	}
	return false
}

/** Clear saved theme from localStorage */
const clear = (): void => {
	persistence?.clear()
}

/** Apply scoped theme to a container element */
const scope = (element: HTMLElement, theme: Partial<ThemeColors>): void => {
	for (const [ key, val ] of Object.entries(theme)) {
		const cssKey = toKebabCase(key)
		element.style.setProperty(`${ prefix }${ cssKey }`, val)
	}
}

/**
 * Bind a theme property to an input element for real-time updates.
 * @returns Unbind function
 */
const bind = (key: string, input: HTMLInputElement): (() => void) => {
	const handler = (e: Event) => set(key, (e.target as HTMLInputElement).value)
	input.addEventListener('input', handler)

	// Set initial value
	const currentVal = current[key as keyof ThemeColors]
	if (currentVal) {
		input.value = currentVal
	}

	return () => input.removeEventListener('input', handler)
}

/** Add event listener */
const on = (event: string, callback: EventCallback): (() => void) =>
	events.on(event, callback)

/** Remove event listener */
const off = (event: string, callback: EventCallback): void =>
	events.off(event, callback)

// =============================================================================
// Color utilities (resolve theme keys before calling raw functions)
// =============================================================================

/** Lighten a theme color or CSS color */
const lighten = (key: string, amount: number): string =>
	lightenColor(resolveColor(key), amount)

/** Darken a theme color or CSS color */
const darken = (key: string, amount: number): string =>
	darkenColor(resolveColor(key), amount)

/** Add alpha to a theme color or CSS color */
const alpha = (key: string, alphaValue: number): string =>
	alphaColor(resolveColor(key), alphaValue)

/** Calculate contrast between two colors (resolves theme keys) */
const contrast = (color1: string, color2: string): number =>
	rawContrast(resolveColor(color1), resolveColor(color2))

/** Check if two colors are readable (resolves theme keys) */
const isReadable = (
	color1: string,
	color2: string,
	options?: Parameters<typeof rawIsReadable>[2]
): boolean => rawIsReadable(resolveColor(color1), resolveColor(color2), options)

/** Get contrast info for two colors (resolves theme keys) */
const contrastInfo = (color1: string, color2: string) =>
	rawContrastInfo(resolveColor(color1), resolveColor(color2))

/** Pick best contrasting color (resolves theme keys) */
const bestContrast = (background: string, options: string[]): string =>
	rawBestContrast(resolveColor(background), options)

// =============================================================================
// Preset Validation
// =============================================================================

interface ValidationResult {
	valid: boolean
	issues: string[]
	warnings: string[]
	ratios: Record<string, number>
}

/** Validate all presets for WCAG contrast compliance */
const validatePresets = (log = false): Record<string, ValidationResult> => {
	const results: Record<string, ValidationResult> = {}

	// WCAG 2.1 thresholds
	const AA_NORMAL = 4.5
	const AA_LARGE = 3
	const DECORATIVE = 1.3

	for (const name of Object.keys(presets)) {
		const theme = presets[name]
		const issues: string[] = []
		const warnings: string[] = []
		const ratios: Record<string, number> = {}

		// Primary text
		ratios.bgFg = contrastWithAlpha(theme.bg, theme.fg)
		if (ratios.bgFg < AA_NORMAL) {
			issues.push(`bg/fg ${ ratios.bgFg.toFixed(2) }:1 fails AA (needs ${ AA_NORMAL }:1)`)
		}

		// Elevated surfaces
		if (theme.bgElevated) {
			ratios.bgElevatedFg = contrastWithAlpha(theme.bgElevated, theme.fg)
			if (ratios.bgElevatedFg < AA_NORMAL) {
				issues.push(`bgElevated/fg ${ ratios.bgElevatedFg.toFixed(2) }:1 fails AA`)
			}
		}

		// Muted text
		if (theme.muted) {
			ratios.bgMuted = contrastWithAlpha(theme.bg, theme.muted)
			if (ratios.bgMuted < AA_LARGE) {
				issues.push(`bg/muted ${ ratios.bgMuted.toFixed(2) }:1 fails AA-large`)
			}
		}

		// Headings
		if (theme.heading) {
			ratios.bgHeading = contrastWithAlpha(theme.bg, theme.heading)
			if (ratios.bgHeading < AA_NORMAL) {
				warnings.push(`bg/heading ${ ratios.bgHeading.toFixed(2) }:1 below AA`)
			}
		}

		// Accent visibility
		ratios.bgAccent = contrastWithAlpha(theme.bg, theme.accent)
		if (ratios.bgAccent < AA_LARGE) {
			issues.push(`bg/accent ${ ratios.bgAccent.toFixed(2) }:1 fails AA-large`)
		}

		// Secondary color
		if (theme.secondary) {
			ratios.bgSecondary = contrastWithAlpha(theme.bg, theme.secondary)
			if (ratios.bgSecondary < AA_LARGE) {
				warnings.push(`bg/secondary ${ ratios.bgSecondary.toFixed(2) }:1 below AA-large`)
			}
		}

		// Button text
		if (theme.accentFg) {
			ratios.accentAccentFg = contrastWithAlpha(theme.accent, theme.accentFg)
			if (ratios.accentAccentFg < AA_NORMAL) {
				issues.push(`accent/accentFg ${ ratios.accentAccentFg.toFixed(2) }:1 fails AA`)
			}
		}

		// Status colors
		if (theme.positive) {
			ratios.bgPositive = contrastWithAlpha(theme.bg, theme.positive)
			if (ratios.bgPositive < AA_LARGE) {
				issues.push(`bg/positive ${ ratios.bgPositive.toFixed(2) }:1 fails AA-large`)
			}
		}

		if (theme.negative) {
			ratios.bgNegative = contrastWithAlpha(theme.bg, theme.negative)
			if (ratios.bgNegative < AA_LARGE) {
				issues.push(`bg/negative ${ ratios.bgNegative.toFixed(2) }:1 fails AA-large`)
			}
		}

		if (theme.warning) {
			ratios.bgWarning = contrastWithAlpha(theme.bg, theme.warning)
			if (ratios.bgWarning < AA_LARGE) {
				issues.push(`bg/warning ${ ratios.bgWarning.toFixed(2) }:1 fails AA-large`)
			}
		}

		// Border visibility
		if (theme.border) {
			ratios.bgBorder = contrastWithAlpha(theme.bg, theme.border)
			if (ratios.bgBorder < DECORATIVE) {
				warnings.push(`bg/border ${ ratios.bgBorder.toFixed(2) }:1 may be invisible`)
			}
		}

		// Selected state
		const accentRgb = parseColor(theme.accent)
		if (accentRgb) {
			const selectedBg = blendColors(`rgba(${ accentRgb.join(',') }, 0.1)`, theme.bg)
			const selectedBgHex = rgbToHex(...(selectedBg as RGB))
			ratios.selectedBgAccent = contrastWithAlpha(selectedBgHex, theme.accent)
			if (ratios.selectedBgAccent < AA_LARGE) {
				warnings.push(`selected bg/accent ${ ratios.selectedBgAccent.toFixed(2) }:1 below AA-large`)
			}
		}

		results[name] = { valid: issues.length === 0, issues, warnings, ratios }

		if (log) {
			const status = issues.length === 0 ? '✓' : '✗'
			const warn = warnings.length > 0 ? ` (${ warnings.length } warnings)` : ''
			console.log(`${ status } ${ name }${ warn }`)
			issues.forEach(issue => console.log(`  ✗ ${ issue }`))
			warnings.forEach(warning => console.log(`  ⚠ ${ warning }`))
		}
	}

	if (log) {
		const total = Object.keys(results).length
		const passing = Object.values(results).filter(r => r.valid).length
		const withWarnings = Object.values(results).filter(r => r.warnings.length > 0).length
		console.log('\n--- SUMMARY ---')
		console.log(`Total: ${ total } | Passing: ${ passing } | Failing: ${ total - passing } | With warnings: ${ withWarnings }`)
	}

	return results
}

// =============================================================================
// Export
// =============================================================================

export const GooTheme = {
	init,
	set,
	get,
	preset,
	register,
	get presets() { return getPresets() },
	auto,
	get isDark() { return isDark() },
	get isLight() { return isLight() },
	persist,
	restore,
	clear,
	scope,
	bind,
	on,
	off,

	// Color utilities
	contrast,
	contrastInfo,
	isReadable,
	bestContrast,
	validatePresets,
	lighten,
	darken,
	alpha
}

export default GooTheme
