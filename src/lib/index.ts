/**
 * @goobits/themes - Theme system for Svelte 5 applications
 *
 * Re-exports all theme modules for convenience
 */

export * from './core/index.js'
export * from './goo/index.js'
export * from './server/index.js'
export * from './svelte/index.js'
export * from './utils/index.js'

// These names also have compatibility exports under utils. The package root
// consistently exposes the configuration-aware core implementations.
export { resolveThemeMode } from './core/config.js'
export { watchSystemTheme } from './core/themeManager.js'
