<script lang="ts">
    import { onMount } from 'svelte';
    import { isBrowser } from '../../utils/browser';
    import { getHtmlElement } from '../../utils/dom';
    import { prefersDarkMode, getDarkModeMediaQuery } from '../../utils/system-theme';
    import { useTheme } from '../hooks/useTheme.svelte';

    /**
     * ThemeSync - Utility component to keep data-theme attribute synchronized
     *
     * @deprecated As of v1.2.0, this component is DEPRECATED and no longer necessary.
     *
     * The ThemeProvider component now automatically manages the data-theme attribute on
     * the <html> element, making this component redundant for most use cases.
     *
     * **This component will be removed in v2.0.0.**
     *
     * ## Migration Guide
     *
     * Simply remove `<ThemeSync />` from your code. The ThemeProvider handles everything:
     *
     * ```svelte
     * <!-- BEFORE (v1.1.x) -->
     * <ThemeProvider {config} {serverPreferences}>
     *   <ThemeSync />  <!-- ❌ No longer needed -->
     *   {@render children()}
     * </ThemeProvider>
     *
     * <!-- AFTER (v1.2.0+) -->
     * <ThemeProvider {config} {serverPreferences}>
     *   {@render children()}  <!-- ✅ ThemeSync happens automatically -->
     * </ThemeProvider>
     * ```
     *
     * ## When You Might Still Need This (Rare)
     *
     * Only keep this component if you have very specific requirements like:
     * - Setting data-theme on additional DOM elements beyond <html>
     * - Custom theme sync logic that differs from the default behavior
     *
     * For the vast majority of users, this component should be removed.
     *
     * @see {@link ThemeProvider} for automatic theme and data-theme management
     */

    const theme = useTheme();

    // Sync data-theme attribute whenever theme changes
    $effect(() => {
        if (isBrowser()) {
            const html = getHtmlElement();
            if (!html) return;

            // Determine resolved theme (always "light" or "dark", never "system")
            let resolvedTheme: 'light' | 'dark';

            if (theme.theme === 'system') {
                resolvedTheme = prefersDarkMode() ? 'dark' : 'light';
            } else {
                resolvedTheme = theme.theme;
            }

            // Set data-theme attribute
            html.dataset.theme = resolvedTheme;
        }
    });

    // Listen for system theme changes when in system mode
    onMount(() => {
        if (!isBrowser()) return;

        const mediaQuery = getDarkModeMediaQuery();
        if (!mediaQuery) return;

        const handleChange = () => {
            if (theme.theme === 'system') {
                const html = getHtmlElement();
                if (!html) return;
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
