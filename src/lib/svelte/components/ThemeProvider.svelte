<!--
  @component ThemeProvider

  Root provider component for the theme system.

  Wraps your application to provide theme context to all child components.
  Handles theme initialization, route-based theme switching, and creates
  the reactive theme store accessible via useTheme().

  @prop {ThemeConfig} config - Theme configuration with schemes and route themes
  @prop {Object} serverPreferences - Server-loaded preferences from cookies
  @prop {ThemeMode} serverPreferences.theme - Initial theme mode
  @prop {ThemeScheme} serverPreferences.themeScheme - Initial color scheme

  @example
  ```svelte
  <ThemeProvider {config} serverPreferences={data.preferences}>
    <slot />
  </ThemeProvider>
  ```
-->
<script lang="ts">
	import { onMount, setContext, untrack } from 'svelte'

	import { page } from '$app/stores'

	import type { ThemeConfig } from '../../core/config'
	import { applyRouteTheme, initializeTheme } from '../../core/theme-manager'
	import type { ThemeMode, ThemeScheme } from '../../core/types'
	import { isBrowser } from '../../utils/browser'
	import { createThemeStore } from '../stores/theme.svelte'

	const {
		children,
		config,
		serverPreferences
	}: {
		children: import('svelte').Snippet
		config: ThemeConfig
		serverPreferences?: { theme: ThemeMode; themeScheme: ThemeScheme }
	} = $props()

	// Use untrack to explicitly capture initial config value - the store is created once
	// and doesn't need to react to config prop changes during the component's lifetime
	const themeStore = untrack(() => createThemeStore(config))
	setContext('theme', themeStore)

	let initialized = $state(false)
	const fallbackPreferences: { theme: ThemeMode; themeScheme: ThemeScheme } = {
		theme: 'system',
		themeScheme: 'default'
	}
	const resolvedPreferences = $derived.by(
		() => serverPreferences ?? $page.data?.preferences
	)

	// Apply server preferences if provided
	$effect(() => {
		if (resolvedPreferences) {
			themeStore.setTheme(resolvedPreferences.theme)
			themeStore.setScheme(resolvedPreferences.themeScheme)
		}
	})

	// Initialize theme on the client
	onMount(() => {
		const preferences = resolvedPreferences ?? themeStore.settings ?? fallbackPreferences
		const cleanup = initializeTheme(preferences.theme, preferences.themeScheme)
		initialized = true
		return cleanup
	})

	// Apply route theme when pathname changes or theme/scheme is changed by user
	// The store's theme/scheme properties are now reactive via class $state fields
	$effect(() => {
		if (isBrowser() && initialized) {
			const currentPath = $page.url.pathname

			// themeStore.theme and themeStore.scheme are reactive - Svelte tracks them
			applyRouteTheme(currentPath, themeStore.theme, themeStore.scheme, config.routeThemes || {})
		}
	})
</script>

{@render children()}
