<script lang="ts">
    import { onMount, setContext } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import { createThemeStore } from '../stores/theme.svelte';
    import { initializeTheme, applyRouteTheme } from '../../core/theme-manager';
    import type { ThemeMode, ThemeScheme } from '../../core/types';
    import type { ThemeConfig } from '../../core/config';

    const {
        children,
        config,
        serverPreferences,
    }: {
        children: import('svelte').Snippet;
        config: ThemeConfig;
        serverPreferences: { theme: ThemeMode; themeScheme: ThemeScheme };
    } = $props();

    const themeStore = createThemeStore(config);
    setContext('theme', themeStore);

    let initialized = $state(false);

    // Initialize theme on the client
    onMount(() => {
        const cleanup = initializeTheme(serverPreferences.theme, serverPreferences.themeScheme);
        initialized = true;
        return cleanup;
    });

    // Apply route theme when pathname changes or theme/scheme is changed by user
    // This effect properly tracks all dependencies: pathname, theme, and scheme
    $effect(() => {
        if (browser && initialized) {
            // Access all dependencies at the top level so Svelte tracks them
            const currentPath = $page.url.pathname;
            const currentTheme = themeStore.theme;
            const currentScheme = themeStore.scheme;

            // Apply theme based on current route and user preferences
            applyRouteTheme(
                currentPath,
                currentTheme,
                currentScheme,
                config.routeThemes || {}
            );
        }
    });
</script>

{@render children()}
