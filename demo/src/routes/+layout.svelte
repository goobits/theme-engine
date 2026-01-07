<script lang="ts">
	import { ThemeProvider } from '../../../src/lib/svelte/index.js'
	import gooBundleUrl from '../../../themes/goo/bundle.css?url'
	import favicon from '$lib/assets/favicon.svg'
	import { themeConfig } from '$lib/config/theme.js'

	const { children } = $props()
</script>

<svelte:head>
    <title>@goobits/themes Demo</title>
    <link rel="stylesheet" href={gooBundleUrl} />
    <link rel="icon" href={favicon} />
</svelte:head>

<ThemeProvider config={themeConfig}>
    <div class="app">
        <main class="content">
            {@render children()}
        </main>
    </div>
</ThemeProvider>

<style>
	.app {
		min-height: 100vh;
		background: var(--bg-primary);
	}

	.content {
		padding-top: 1rem;
	}

	@media (max-width: 768px) {
		.content {
			padding-top: 0.5rem;
		}
	}
</style>
