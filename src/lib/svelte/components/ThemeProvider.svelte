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
    import { onMount, setContext, untrack } from 'svelte';
    import { page } from '$app/stores';
    import { isBrowser } from '../../utils/browser';
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

    // Use untrack to explicitly capture initial config value - the store is created once
    // and doesn't need to react to config prop changes during the component's lifetime
    const themeStore = untrack(() => createThemeStore(config));
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
        if (isBrowser() && initialized) {
            // Access all dependencies at the top level so Svelte tracks them
            const currentPath = $page.url.pathname;
            const currentTheme = themeStore.theme;
            const currentScheme = themeStore.scheme;

            // Apply theme based on current route and user preferences
            applyRouteTheme(currentPath, currentTheme, currentScheme, config.routeThemes || {});
        }
    });
</script>

{@render children()}
