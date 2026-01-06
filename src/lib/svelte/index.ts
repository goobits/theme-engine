/**
 * Svelte Components and Stores
 *
 * Ready-to-use Svelte 5 components for theme management, plus reactive
 * stores and hooks for custom implementations.
 *
 * Components:
 * - {@link ThemeProvider} - Root context provider (required)
 * - {@link ThemeToggle} - Light/dark/system toggle button
 * - {@link SchemeSelector} - Color scheme picker
 * - {@link ThemeSync} - Legacy sync component (deprecated)
 *
 * @module svelte
 *
 * @example
 * ```svelte
 * <script>
 *   import { ThemeProvider, ThemeToggle, useTheme } from '@goobits/themes/svelte';
 * </script>
 *
 * <ThemeProvider {config} {serverPreferences}>
 *   <ThemeToggle />
 * </ThemeProvider>
 * ```
 */

export { default as SchemeSelector } from './components/SchemeSelector.svelte'
export { default as ThemeProvider } from './components/ThemeProvider.svelte'
export { default as ThemeSync } from './components/ThemeSync.svelte'
export { default as ThemeToggle } from './components/ThemeToggle.svelte'
export * from './hooks/useTheme.svelte'
export * from './stores/theme.svelte'
