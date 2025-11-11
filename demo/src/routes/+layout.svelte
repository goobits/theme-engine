<script lang="ts">
	import { ThemeProvider } from '@goobits/themes/svelte';
	import '@goobits/themes/themes';
	import '@goobits/themes/themes/default.css';
	import '@goobits/themes/themes/spells.css';
	import favicon from '$lib/assets/favicon.svg';
	import type { ThemeConfig } from '@goobits/themes';

	let { children } = $props();

	const themeConfig: ThemeConfig = {
		schemes: {
			default: {
				name: 'default',
				displayName: 'Default',
				description: 'Clean, professional design',
				preview: {
					primary: '#3b82f6',
					accent: '#60a5fa',
					background: '#ffffff'
				}
			},
			spells: {
				name: 'spells',
				displayName: 'Spells',
				description: 'Magical purple theme',
				preview: {
					primary: '#8b5cf6',
					accent: '#a78bfa',
					background: '#ffffff'
				}
			}
		}
	};
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ThemeProvider config={themeConfig}>
	{@render children()}
</ThemeProvider>
