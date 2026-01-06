/**
 * Theme Store Module
 *
 * Reactive Svelte 5 store for theme state management.
 * Handles persistence to localStorage and cookies automatically.
 *
 * @module stores/theme
 */

import type { ThemeConfig } from '../../core/config'
import type { SchemeConfig,ThemeMode, ThemeScheme } from '../../core/types'
import { isBrowser } from '../../utils/browser'
import { loadThemePreferences,saveThemePreferences } from './theme-persistence'

/**
 * Internal theme settings structure.
 *
 * Represents the raw theme preferences stored in localStorage/cookies.
 */
export interface ThemeSettings {

	/** Current theme mode preference */
	theme: ThemeMode;

	/** Current color scheme identifier */
	themeScheme: ThemeScheme;
}

/**
 * Snapshot of theme store state for subscribers.
 *
 * Used by the subscribe function for compatibility with
 * non-runes code and external state management.
 */
export interface ThemeStoreSnapshot {

	/** Complete settings object */
	settings: ThemeSettings;

	/** Current theme mode */
	theme: ThemeMode;

	/** Current color scheme */
	scheme: ThemeScheme;
}

/**
 * Theme store interface with reactive state and methods.
 *
 * Provides reactive access to theme state and methods to modify it.
 * All changes are automatically persisted to localStorage and cookies.
 *
 * @example
 * ```typescript
 * const store = createThemeStore(config);
 * store.setTheme('dark');
 * console.log(store.theme); // 'dark'
 * ```
 */
export interface ThemeStore {

	/** Subscribe to store changes (for non-runes compatibility) */
	subscribe: (fn: (value: ThemeStoreSnapshot) => void) => () => void;

	/** Current settings object (reactive) */
	readonly settings: ThemeSettings;

	/** Current theme mode (reactive) */
	readonly theme: ThemeMode;

	/** Current color scheme (reactive) */
	readonly scheme: ThemeScheme;

	/** Available color schemes from config */
	readonly availableSchemes: SchemeConfig[];

	/** Set the theme mode */
	setTheme(theme: ThemeMode): void;

	/** Set the color scheme */
	setScheme(scheme: ThemeScheme): void;

	/** Cycle through modes: light → dark → system → light */
	cycleMode(): void;
}

/**
 * Creates a reactive theme store with persistence.
 *
 * The store automatically syncs theme preferences to both localStorage
 * and cookies, enabling SSR support and cross-tab synchronization.
 *
 * @param config - Theme configuration with available schemes
 * @returns A reactive ThemeStore instance
 *
 * @example
 * ```typescript
 * import { createThemeStore } from '@goobits/themes/svelte';
 *
 * const themeStore = createThemeStore({
 *   schemes: {
 *     default: { name: 'default', displayName: 'Default', ... }
 *   }
 * });
 *
 * // Use reactive properties
 * $effect(() => {
 *   console.log('Theme changed:', themeStore.theme);
 * });
 *
 * // Change theme programmatically
 * themeStore.setTheme('dark');
 * ```
 *
 * @remarks
 * - On initial load, attempts to restore from localStorage, then cookies
 * - All changes are persisted automatically
 * - The store is designed for use with Svelte 5 runes
 */
export function createThemeStore(config: ThemeConfig): ThemeStore {
	const defaultSettings: ThemeSettings = {
		theme: 'system',
		themeScheme: Object.keys(config.schemes)[0] || 'default'
	}

	let settings = $state<ThemeSettings>(defaultSettings)

	// Load saved preferences on initialization (browser only)
	if (isBrowser()) {
		const saved = loadThemePreferences()
		if (saved) {
			settings = { ...defaultSettings, ...saved }
		}
	}

	const theme = $derived(settings.theme)
	const scheme = $derived(settings.themeScheme)
	const availableSchemes = $derived(Object.values(config.schemes))

	function setTheme(newTheme: ThemeMode) {
		settings.theme = newTheme
		saveThemePreferences(settings)
		notifySubscribers()
	}

	function setScheme(newScheme: ThemeScheme) {
		settings.themeScheme = newScheme
		saveThemePreferences(settings)
		notifySubscribers()
	}

	function cycleMode() {
		const modes: ThemeMode[] = [ 'light', 'dark', 'system' ]
		const currentIndex = modes.indexOf(settings.theme)
		const nextIndex = (currentIndex + 1) % modes.length
		setTheme(modes[nextIndex])
	}

	// Create a subscribe function for backward compatibility with non-runes code
	let subscribers = new Set<(value: ThemeStoreSnapshot) => void>()

	const notifySubscribers = () => {
		const snapshot: ThemeStoreSnapshot = {
			settings,
			theme,
			scheme
		}
		subscribers.forEach(fn => fn(snapshot))
	}

	const subscribe = (fn: (value: ThemeStoreSnapshot) => void): (() => void) => {
		subscribers.add(fn)

		// Immediately call the subscriber with current value
		fn({
			settings,
			theme,
			scheme
		})
		return () => {
			subscribers.delete(fn)
		}
	}

	return {
		subscribe,
		get settings() {
			return settings
		},
		get theme() {
			return theme
		},
		get scheme() {
			return scheme
		},
		get availableSchemes() {
			return availableSchemes
		},
		setTheme,
		setScheme,
		cycleMode
	}
}
