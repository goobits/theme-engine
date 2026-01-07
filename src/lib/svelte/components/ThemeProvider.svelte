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
	let currentTheme = $state(themeStore.theme)
	let currentScheme = $state(themeStore.scheme)

	if (serverPreferences) {
		themeStore.setTheme(serverPreferences.theme)
		themeStore.setScheme(serverPreferences.themeScheme)
	}

	// Initialize theme on the client
	onMount(() => {
		const unsubscribe = themeStore.subscribe(snapshot => {
			currentTheme = snapshot.theme
			currentScheme = snapshot.scheme
		})

		const preferences = serverPreferences ?? themeStore.settings
		const cleanup = initializeTheme(preferences.theme, preferences.themeScheme)
		initialized = true
		return () => {
			unsubscribe()
			cleanup()
		}
	})

	// Apply route theme when pathname changes or theme/scheme is changed by user
	// This effect properly tracks all dependencies: pathname, theme, and scheme
	$effect(() => {
		if (isBrowser() && initialized) {
			// Access all dependencies at the top level so Svelte tracks them
			const currentPath = $page.url.pathname

			// Apply theme based on current route and user preferences
			applyRouteTheme(currentPath, currentTheme, currentScheme, config.routeThemes || {})
		}
	})
</script>

{@render children()}
