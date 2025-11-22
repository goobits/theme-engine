<!--
  @component ThemeToggle

  Accessible button that cycles through theme modes.

  Displays an icon (Sun/Moon/Monitor) representing the current theme mode
  and cycles through light → dark → system on each click. Includes full
  ARIA support with live region announcements for screen readers.

  Must be used within a ThemeProvider component.

  @example
  ```svelte
  <ThemeToggle />
  ```

  @accessibility
  - Uses aria-label for the next theme mode
  - Announces theme changes to screen readers via live region
  - Supports keyboard navigation (Enter/Space to activate)
-->
<script lang="ts">
    import { Sun, Moon, Monitor } from '@lucide/svelte';
    import { useTheme } from '../hooks/useTheme.svelte';
    import { ARIA_ANNOUNCEMENT_DURATION_MS } from '../../core/constants';

    const theme = useTheme();
    const currentTheme = $derived(theme.theme);
    const currentScheme = $derived(theme.scheme);

    // Track if this is the initial load to prevent announcing on page load
    let isInitialLoad = $state(true);

    // Announce theme changes to screen readers
    function announce(message: string) {
        if (typeof document !== 'undefined') {
            const liveRegion = document.getElementById('aria-live-region');
            if (liveRegion) {
                liveRegion.textContent = message;
                // Clear after specified duration to avoid cluttering screen reader history
                setTimeout(() => {
                    if (liveRegion.textContent === message) {
                        liveRegion.textContent = '';
                    }
                }, ARIA_ANNOUNCEMENT_DURATION_MS);
            }
        }
    }

    // Watch for theme changes and announce to screen readers
    $effect(() => {
        // Skip announcement on initial page load
        if (isInitialLoad) {
            isInitialLoad = false;
            return;
        }

        // Announce the theme change
        const schemeConfig = theme.availableSchemes.find(s => s.name === currentScheme);
        const schemeName = schemeConfig?.displayName || 'Default';

        switch (currentTheme) {
            case 'light':
                announce(
                    `Switched to light theme${schemeName !== 'Default' ? ` with ${schemeName} colors` : ''}`
                );
                break;
            case 'dark':
                announce(
                    `Switched to dark theme${schemeName !== 'Default' ? ` with ${schemeName} colors` : ''}`
                );
                break;
            case 'system':
                announce(
                    `Switched to system theme${schemeName !== 'Default' ? ` with ${schemeName} colors` : ''}`
                );
                break;
        }
    });

    function cycleTheme() {
        theme.cycleMode();
    }

    const themeInfo = $derived(
        (() => {
            const schemeConfig = theme.availableSchemes.find(s => s.name === currentScheme);
            const schemeName = schemeConfig?.displayName || 'Default';

            switch (currentTheme) {
                case 'light':
                    return {
                        icon: Sun,
                        tooltip: `Light theme (${schemeName})`,
                        ariaLabel: 'Switch to dark theme',
                    };
                case 'dark':
                    return {
                        icon: Moon,
                        tooltip: `Dark theme (${schemeName})`,
                        ariaLabel: 'Switch to system theme',
                    };
                case 'system':
                    return {
                        icon: Monitor,
                        tooltip: `System theme (${schemeName})`,
                        ariaLabel: 'Switch to light theme',
                    };
                default:
                    return {
                        icon: Monitor,
                        tooltip: `System theme (${schemeName})`,
                        ariaLabel: 'Switch to light theme',
                    };
            }
        })()
    );
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
        <Icon size={20} />
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
        color: currentColor;
    }

    .theme-toggle:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .theme-toggle :global(svg) {
        width: 1.25rem;
        height: 1.25rem;
        color: currentColor;
    }
</style>
