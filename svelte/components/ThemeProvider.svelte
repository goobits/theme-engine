<script lang="ts">
  import { onMount, setContext } from 'svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { createThemeStore, type ThemeStore } from '../stores/theme.svelte';
  import { initializeTheme, applyRouteTheme } from '../../core/theme-manager';
  import type { ThemeMode, ThemeScheme } from '../../core/types';
  import type { ThemeConfig } from '../../core/config';

  const { children, config, serverPreferences }: {
    children: import('svelte').Snippet;
    config: ThemeConfig;
    serverPreferences: { theme: ThemeMode; themeScheme: ThemeScheme };
  } = $props();

  const themeStore = createThemeStore(config);
  setContext('theme', themeStore);

  let lastAppliedTheme = $state<ThemeMode | undefined>();
  let lastAppliedScheme = $state<ThemeScheme | undefined>();

  // Initialize theme on the client
  onMount(() => {
    const cleanup = initializeTheme(serverPreferences.theme, serverPreferences.themeScheme);
    lastAppliedTheme = serverPreferences.theme;
    lastAppliedScheme = serverPreferences.themeScheme;
    return cleanup;
  });

  // Apply route theme when page changes or theme is changed by user
  $effect(() => {
    if (browser) {
      const currentTheme = themeStore.theme;
      const currentScheme = themeStore.scheme;

      if (currentTheme !== lastAppliedTheme || currentScheme !== lastAppliedScheme) {
        applyRouteTheme(
          $page.url.pathname,
          currentTheme,
          currentScheme,
          config.routeThemes || {}
        );

        lastAppliedTheme = currentTheme;
        lastAppliedScheme = currentScheme;
      }
    }
  });
</script>

{@render children()}
