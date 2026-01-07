<script lang="ts">
	import { ThemeProvider } from '@goobits/themes/svelte'
	import '@goobits/themes/themes/bundle.css'
	import favicon from '$lib/assets/favicon.svg'
	import { themeConfig } from '$lib/config/theme.js'

	const { children } = $props()
</script>

<svelte:head>
    <title>@goobits/themes Demo</title>
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

	:global(.scheme-midnight) {
		--bg-primary: #1d1d1f;
		--bg-secondary: #2d2d2f;
		--bg-tertiary: #242426;
		--text-primary: #f5f5f7;
		--text-secondary: #86868b;
		--border-primary: #424245;
		--scheme-accent-primary: #2997ff;
		--scheme-accent-glow: #66b7ff;
		--accent-soft: color-mix(in srgb, var(--scheme-accent-primary) 20%, transparent);
	}

	:global(.scheme-forest) {
		--bg-primary: #f8faf8;
		--bg-secondary: #eef3ee;
		--bg-tertiary: #e4ece4;
		--text-primary: #1a2e1a;
		--text-secondary: #5a7a5a;
		--border-primary: #c8d8c8;
		--scheme-accent-primary: #2d8a2d;
		--scheme-accent-glow: #48b048;
		--accent-soft: color-mix(in srgb, var(--scheme-accent-primary) 18%, transparent);
	}

	:global(.scheme-rose) {
		--bg-primary: #fefbfb;
		--bg-secondary: #fdf4f4;
		--bg-tertiary: #f7eded;
		--text-primary: #2d1f1f;
		--text-secondary: #9a7a7a;
		--border-primary: #e8d8d8;
		--scheme-accent-primary: #e85d75;
		--scheme-accent-glow: #f07f93;
		--accent-soft: color-mix(in srgb, var(--scheme-accent-primary) 18%, transparent);
	}

	@media (max-width: 768px) {
		.content {
			padding-top: 0.5rem;
		}
	}
</style>
