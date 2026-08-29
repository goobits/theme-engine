<script lang="ts">
	import type { ThemeConfig } from '../../src/lib/core/config.js'
	import type { ThemeMode, ThemeScheme } from '../../src/lib/core/schemeRegistry.js'
	import SchemeSelector from '../../src/lib/svelte/components/SchemeSelector.svelte'
	import ThemeProvider from '../../src/lib/svelte/components/ThemeProvider.svelte'
	import ThemeSync from '../../src/lib/svelte/components/ThemeSync.svelte'
	import ThemeToggle from '../../src/lib/svelte/components/ThemeToggle.svelte'
	import ThemeConsumer from './ThemeConsumer.svelte'

	let {
		config,
		serverPreferences
	}: {
		config: ThemeConfig
		serverPreferences: { theme: ThemeMode; themeScheme: ThemeScheme }
	} = $props()
</script>

<div id="aria-live-region" data-testid="aria-live-region"></div>

<ThemeProvider {config} {serverPreferences}>
	<ThemeToggle />
	<SchemeSelector />
	<ThemeSync />
	<ThemeConsumer />
</ThemeProvider>
