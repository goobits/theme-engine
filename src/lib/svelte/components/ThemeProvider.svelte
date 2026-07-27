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

	import type { ThemeConfig } from '../../core/config.js'
	import type { ThemeMode, ThemeScheme } from '../../core/schemeRegistry.js'
	import { applyRouteTheme, initializeTheme } from '../../core/themeManager.js'
	import { isBrowser } from '../../utils/browser.js'
	import { createThemeStore } from '../stores/theme.svelte.js'

	const {
		children,
		config,
		serverPreferences
	}: {
		children: import('svelte').Snippet
		config: ThemeConfig
		serverPreferences?: { theme: ThemeMode; themeScheme: ThemeScheme }
	} = $props()

	const initialPreferences = untrack(() => serverPreferences ?? $page.data?.['preferences'])

	// The store resolves browser persistence over the SSR seed during construction,
	// matching the blocking script and preventing hydration from restoring stale cookies.
	const themeStore = untrack(() => createThemeStore(config, initialPreferences))
	setContext('theme', themeStore)

	let initialized = $state(false)

	// Initialize theme on the client
	onMount(() => {
		const cleanup = initializeTheme(themeStore.theme, themeStore.scheme)
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
