// packages/svelte-themes/src/svelte/hooks/useTheme.svelte.ts
import { getContext } from 'svelte';
import type { ThemeStore } from '../stores/theme.svelte';

/**
 * A Svelte hook for accessing the theme store.
 * @returns The theme store.
 * @throws {Error} If used outside of a ThemeProvider.
 */
export function useTheme(): ThemeStore {
  const theme = getContext<ThemeStore>('theme');
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
