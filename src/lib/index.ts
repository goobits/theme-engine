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

// `watchSystemTheme` is defined in both core/themeManager and utils/systemTheme.
// Re-export the core version explicitly to resolve the ambiguity at the package root.
export { watchSystemTheme } from './core/themeManager.js'
