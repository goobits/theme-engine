<!-- packages/svelte-themes/src/svelte/components/ThemeToggle.svelte -->
<script lang="ts">
	/**
	 * A Svelte component for toggling the theme.
	 * @component
	 */
	import { Sun, Moon, Monitor } from '@lucide/svelte';
	import { useTheme } from '../hooks/useTheme.svelte';

	const theme = useTheme();
	const currentTheme = $derived(theme.theme);
	const currentScheme = $derived(theme.scheme);

	function cycleTheme() {
		theme.cycleMode();
	}

	const themeInfo = $derived((() => {
		const schemeConfig = theme.availableSchemes.find(s => s.name === currentScheme);
		const schemeName = schemeConfig?.displayName || 'Default';

		switch (currentTheme) {
			case 'light':
				return {
					icon: Sun,
					tooltip: `Light theme (${schemeName})`,
					ariaLabel: 'Switch to dark theme'
				};
			case 'dark':
				return {
					icon: Moon,
					tooltip: `Dark theme (${schemeName})`,
					ariaLabel: 'Switch to system theme'
				};
			case 'system':
				return {
					icon: Monitor,
					tooltip: `System theme (${schemeName})`,
					ariaLabel: 'Switch to light theme'
				};
			default:
				return {
					icon: Monitor,
					tooltip: `System theme (${schemeName})`,
					ariaLabel: 'Switch to light theme'
				};
		}
	})());
</script>

<button
	onclick={cycleTheme}
	title={themeInfo.tooltip}
	aria-label={themeInfo.ariaLabel}
	data-testid="theme-toggle"
	class="theme-toggle"
>
	{#if themeInfo.icon}
		{@const Icon = themeInfo.icon}
		<Icon class="theme-toggle-icon" />
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		width: 2.5rem;
		height: 2.5rem;
		border: 1px solid transparent;
		background-color: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.theme-toggle:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.theme-toggle-icon {
		width: 1.25rem;
		height: 1.25rem;
		color: #6b7280;
	}
</style>
