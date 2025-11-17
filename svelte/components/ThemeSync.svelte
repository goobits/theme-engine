<script lang="ts">
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    import { useTheme } from '../hooks/useTheme.svelte';

    /**
     * ThemeSync - Utility component to keep data-theme attribute synchronized
     *
     * Note: As of v1.2.0, the ThemeProvider automatically sets data-theme on the
     * <html> element, so this component is optional and mainly useful for:
     * - Apps that need additional elements to have data-theme
     * - Custom theme sync logic beyond the default behavior
     * - Backwards compatibility with older versions
     *
     * Usage:
     * ```svelte
     * <ThemeSync />
     * ```
     *
     * The component renders nothing and simply ensures data-theme stays in sync.
     */

    const theme = useTheme();

    // Sync data-theme attribute whenever theme changes
    $effect(() => {
        if (browser && typeof document !== 'undefined') {
            const html = document.documentElement;

            // Determine resolved theme (always "light" or "dark", never "system")
            let resolvedTheme: 'light' | 'dark';

            if (theme.theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                resolvedTheme = prefersDark ? 'dark' : 'light';
            } else {
                resolvedTheme = theme.theme;
            }

            // Set data-theme attribute
            html.dataset.theme = resolvedTheme;
        }
    });

    // Listen for system theme changes when in system mode
    onMount(() => {
        if (!browser) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = () => {
            if (theme.theme === 'system' && typeof document !== 'undefined') {
                const html = document.documentElement;
                html.dataset.theme = mediaQuery.matches ? 'dark' : 'light';
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    });
</script>

<!-- This component renders nothing, it only syncs the data-theme attribute -->
