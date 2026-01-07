/**
 * Server-Side Theme Support
 *
 * SvelteKit hooks and utilities for server-side rendering with themes.
 * Enables flash-free theme loading by injecting theme classes during SSR.
 *
 * @module server
 *
 * @example
 * ```typescript
 * // In hooks.server.ts
 * import { createThemeHooks, loadThemePreferences } from '@goobits/themes/server';
 *
 * export const handle = createThemeHooks(themeConfig);
 * ```
 */

export * from './blockingScript'
export * from './gooSsr'
export * from './hooks'
export * from './preferences'
