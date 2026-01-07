/**
 * Theme Store Module
 *
 * Reactive Svelte 5 store for theme state management.
 * Handles persistence to localStorage and cookies automatically.
 *
 * @module stores/theme
 */

import type { ThemeConfig } from '../../core/config'
import type { SchemeConfig } from '../../core/config'
import type { ThemeMode, ThemeScheme } from '../../core/schemeRegistry'
import { isBrowser } from '../../utils/browser'
import { loadThemePreferences, saveThemePreferences } from './themePersistence'

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
 * Reactive theme store class implementation.
 *
 * Uses Svelte 5 $state fields for proper reactivity across component boundaries.
 * Class instances with $state fields are tracked when accessed from other components,
 * unlike plain objects with getters.
 */
class ThemeStoreImpl implements ThemeStore {
	#config: ThemeConfig
	#subscribers = new Set<(value: ThemeStoreSnapshot) => void>()

	// Reactive state fields - tracked across component boundaries
	theme = $state<ThemeMode>('system')
	scheme = $state<ThemeScheme>('default')

	constructor(config: ThemeConfig) {
		this.#config = config
		const defaultScheme = Object.keys(config.schemes)[0] || 'default'
		this.scheme = defaultScheme

		// Load saved preferences on initialization (browser only)
		if (isBrowser()) {
			const saved = loadThemePreferences()
			if (saved) {
				// Use 'in' check to preserve explicit null values (matches spread behavior)
				// while using defaults for missing/undefined properties
				if ('theme' in saved) {
					this.theme = saved.theme
				}
				if ('themeScheme' in saved) {
					this.scheme = saved.themeScheme
				}
			}
		}
	}

	get settings(): ThemeSettings {
		return {
			theme: this.theme,
			themeScheme: this.scheme
		}
	}

	get availableSchemes(): SchemeConfig[] {
		return Object.values(this.#config.schemes)
	}

	setTheme(newTheme: ThemeMode): void {
		this.theme = newTheme
		saveThemePreferences(this.settings)
		this.#notifySubscribers()
	}

	setScheme(newScheme: ThemeScheme): void {
		this.scheme = newScheme
		saveThemePreferences(this.settings)
		this.#notifySubscribers()
	}

	cycleMode(): void {
		const modes: ThemeMode[] = [ 'light', 'dark', 'system' ]
		const currentIndex = modes.indexOf(this.theme)
		const nextIndex = (currentIndex + 1) % modes.length
		this.setTheme(modes[nextIndex])
	}

	subscribe(fn: (value: ThemeStoreSnapshot) => void): () => void {
		this.#subscribers.add(fn)

		// Immediately call the subscriber with current value
		fn({
			settings: this.settings,
			theme: this.theme,
			scheme: this.scheme
		})
		return () => {
			this.#subscribers.delete(fn)
		}
	}

	#notifySubscribers(): void {
		const snapshot: ThemeStoreSnapshot = {
			settings: this.settings,
			theme: this.theme,
			scheme: this.scheme
		}
		this.#subscribers.forEach(fn => fn(snapshot))
	}
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
	return new ThemeStoreImpl(config)
}
