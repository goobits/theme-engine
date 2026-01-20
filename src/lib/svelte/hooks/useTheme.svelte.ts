// packages/svelte-themes/src/svelte/hooks/useTheme.svelte.ts
import { getContext } from 'svelte'

import type { ThemeStore } from '../stores/theme.svelte.js'

/**
 * Access the theme store from any component.
 *
 * This hook retrieves the theme store from Svelte context, providing access to theme state
 * and methods throughout your component tree. It should be called at the top level of any
 * component that needs to interact with themes. The store is automatically made available
 * by wrapping your app in a ThemeProvider component.
 *
 * The returned theme store provides:
 * - Current theme and scheme information (reactive)
 * - Methods to change theme and scheme
 * - List of available schemes
 * - Subscribe function for external listeners
 *
 * @returns The ThemeStore instance containing reactive theme state and methods
 *
 * @throws {Error} If called outside a ThemeProvider component.
 *         Error message: "useTheme must be used within a ThemeProvider"
 *
 * @example
 * ```typescript
 * // In a Svelte component
 * <script lang="ts">
 *   import { useTheme } from '$lib/svelte/hooks/useTheme.svelte.js';
 *
 *   const { theme, scheme, setTheme, setScheme, cycleMode } = useTheme();
 * </script>
 *
 * <div>
 *   <p>Current theme: {theme}</p>
 *   <p>Current scheme: {scheme}</p>
 *
 *   <button onclick={() => setTheme('dark')}>
 *     Use Dark Theme
 *   </button>
 *
 *   <button onclick={() => cycleMode()}>
 *     Cycle Theme (light → dark → system → light)
 *   </button>
 * </div>
 * ```
 *
 * @remarks
 * - Must be called within a component that is a descendant of ThemeProvider
 * - Returns a reactive Svelte store with current theme state
 * - All theme changes made through the store methods are automatically persisted to localStorage
 * - The store can be used with reactive declarations ($:) or runes
 * - Safe for use in +layout.svelte files to provide theme access app-wide
 *
 * @see {@link ThemeStore} for the store's type definition and available methods
 */
export function useTheme(): ThemeStore {
	const theme = getContext<ThemeStore>('theme')
	if (!theme) {
		throw new Error(
			'useTheme() must be called within a ThemeProvider component.\n\n' +
                'Make sure your root layout is wrapped with ThemeProvider:\n\n' +
                '// src/routes/+layout.svelte\n' +
                '<ThemeProvider config={themeConfig} serverPreferences={data.preferences}>\n' +
                '  {@render children()}\n' +
                '</ThemeProvider>\n\n' +
                'See: https://github.com/goobits/themes#setup'
		)
	}
	return theme
}
